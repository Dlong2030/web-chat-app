import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { IUser } from '../models';
import { RegisterRequest, LoginRequest } from '../types/auth.types';
import { hashPassword, comparePassword, verifyToken } from '../utils/auth.utils';
import { GoogleOAuthService } from './google-oauth.service';
import { FacebookOAuthService } from './facebook-oauth.service';
import { GoogleUserData, FacebookUserData, AuthResult } from '../types/oauth.types';

export class AppError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, statusCode = 400, code = 'GENERAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'pandaappchat';
    private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pandaappchatrefresh';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

    /**
     * Tạo JWT tokens cho người dùng
     */
    private static generateTokens(userId: string): { accessToken: string; refreshToken: string } {
        const signOptions: SignOptions = {
            expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
        };

        const refreshSignOptions: SignOptions = {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn']
        };

        const accessToken = jwt.sign(
            { userId, type: 'access' },
            this.JWT_SECRET,
            signOptions
        );

        const refreshToken = jwt.sign(
            { userId, type: 'refresh' },
            this.JWT_REFRESH_SECRET,
            refreshSignOptions
        );

        return { accessToken, refreshToken };
    }

    static async registerUser(userData: RegisterRequest) {
        // Kiểm tra người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }

        // Kiểm tra username đã được sử dụng chưa (nếu có)
        if (userData.username) {
            const existingUsername = await User.findOne({ username: userData.username });
            if (existingUsername) {
                throw new AppError('Username is already taken', 400, 'USERNAME_TAKEN');
            }
        }

        // Mã hóa mật khẩu
        const hashedPassword = await hashPassword(userData.password);

        // Tạo dữ liệu người dùng
        const newUserData: Partial<IUser> = {
            email: userData.email.toLowerCase(),
            displayName: userData.displayName,
            username: userData.username,
            phoneNumber: userData.phoneNumber,
            bio: userData.bio,
            password: hashedPassword,
            isActive: true,
            isVerified: false,
            status: 'online',
            theme: 'light',
            language: 'vi',
            authProviders: [],
            devices: [],
            notificationSettings: {
                soundEnabled: true,
                vibrationEnabled: true,
                globalMute: false
            },
            stickerPacks: []
        };

        // Thêm thiết bị nếu có
        if (userData.deviceToken) {
            newUserData.devices = [{
                deviceToken: userData.deviceToken,
                deviceType: userData.deviceType || 'web',
                deviceName: userData.deviceName,
                isActive: true,
                lastUsedAt: new Date(),
                createdAt: new Date()
            }];
        }

        // Tạo và lưu người dùng
        const user = new User(newUserData);
        await user.save();
        await user.updateLastSeen();

        // Sinh token bằng phương thức nội bộ
        const tokens = this.generateTokens(user._id.toString());

        return {
            user: user.toPublicJSON(),
            ...tokens
        };
    }

    static async loginUser(loginData: LoginRequest) {
        // Tìm người dùng theo email và lấy trường password
        const user = await User.findOne({ email: loginData.email.toLowerCase() }).select('+password');
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Kiểm tra tài khoản có đang hoạt động không
        if (!user.isActive) {
            throw new AppError('Account disabled', 403, 'ACCOUNT_DISABLED');
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await comparePassword(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Thêm/cập nhật thiết bị nếu có
        if (loginData.deviceToken) {
            await user.addDevice({
                deviceToken: loginData.deviceToken,
                deviceType: loginData.deviceType || 'web',
                deviceName: loginData.deviceName,
                isActive: true,
                lastUsedAt: new Date(),
                createdAt: new Date()
            });
        }

        // Cập nhật lần hoạt động cuối và trạng thái
        await user.updateLastSeen();

        // Sinh token bằng phương thức nội bộ
        const tokens = this.generateTokens(user._id.toString());

        return {
            user: user.toPublicJSON(),
            ...tokens
        };
    }

    static async refreshUserToken(refreshToken: string) {
        // Xác thực refresh token với secret phù hợp
        const refreshSecret = this.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            throw new AppError('Server configuration error', 500, 'CONFIG_ERROR');
        }

        const decoded = verifyToken(refreshToken, refreshSecret);

        if (decoded.type !== 'refresh') {
            throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
        }

        // Tìm người dùng
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }

        // Sinh token mới
        const tokens = this.generateTokens(user._id.toString());

        return {
            user: user.toPublicJSON(),
            ...tokens
        };
    }

    static async logoutUser(userId: string, deviceToken?: string) {
        if (deviceToken) {
            const user = await User.findById(userId);
            if (user) {
                user.devices = user.devices.filter(d => d.deviceToken !== deviceToken);
                await user.save();
            }
        }
        return true;
    }

    /**
     * Xử lý đăng nhập bằng Google OAuth
     */
    static async handleGoogleAuth(code: string, UserModel: any): Promise<AuthResult> {
        try {
            // 1. Đổi code lấy access token
            const tokens = await GoogleOAuthService.exchangeCodeForTokens(code);

            // 2. Lấy thông tin người dùng từ Google
            const googleUser = await GoogleOAuthService.getUserInfo(tokens.accessToken);

            // 3. Tìm hoặc tạo người dùng trong cơ sở dữ liệu
            const authResult = await this.findOrCreateOAuthUser(
                googleUser,
                'google',
                tokens,
                UserModel
            );

            return authResult;
        } catch (error: any) {
            throw new AppError(`Google authentication failed: ${error.message}`, 401, 'GOOGLE_AUTH_FAILED');
        }
    }

    /**
     * Xử lý đăng nhập bằng Facebook OAuth
     */
    static async handleFacebookAuth(code: string, UserModel: any): Promise<AuthResult> {
        try {
            // 1. Đổi code lấy access token
            const shortLivedTokens = await FacebookOAuthService.exchangeCodeForTokens(code);

            // 2. Đổi sang token dài hạn (60 ngày)
            const tokens = await FacebookOAuthService.exchangeForLongLivedToken(shortLivedTokens.accessToken);

            // 3. Lấy thông tin người dùng từ Facebook
            const facebookUser = await FacebookOAuthService.getUserInfo(tokens.accessToken);

            // 4. Tìm hoặc tạo người dùng trong cơ sở dữ liệu
            const authResult = await this.findOrCreateOAuthUser(
                facebookUser,
                'facebook',
                tokens,
                UserModel
            );

            return authResult;
        } catch (error: any) {
            throw new AppError(`Facebook authentication failed: ${error.message}`, 401, 'FACEBOOK_AUTH_FAILED');
        }
    }

    /**
     * Tìm hoặc tạo người dùng từ nhà cung cấp OAuth
     */
    private static async findOrCreateOAuthUser(
        userData: GoogleUserData | FacebookUserData,
        provider: 'google' | 'facebook',
        tokens: any,
        UserModel: any
    ): Promise<AuthResult> {
        let user: IUser;
        let isNewUser = false;

        // 1. Tìm người dùng theo provider ID
        user = await UserModel.findOne({
            'authProviders.provider': provider,
            'authProviders.providerId': userData.id
        });

        if (user) {
            // Người dùng đã tồn tại, cập nhật thông tin OAuth
            await this.updateOAuthProvider(user, provider, userData, tokens);
        } else {
            // 2. Tìm người dùng theo email (nếu có)
            if (userData.email) {
                user = await UserModel.findOne({ email: userData.email });

                if (user) {
                    // Thêm OAuth provider vào người dùng đã có
                    await this.addOAuthProvider(user, provider, userData, tokens);
                } else {
                    // 3. Tạo người dùng mới
                    user = await this.createOAuthUser(userData, provider, tokens, UserModel);
                    isNewUser = true;
                }
            } else {
                throw new AppError('Email is required from OAuth provider', 400, 'EMAIL_REQUIRED');
            }
        }

        // Sinh JWT tokens bằng phương thức nhất quán
        const jwtTokens = this.generateTokens(user._id.toString());

        return {
            user,
            accessToken: jwtTokens.accessToken,
            refreshToken: jwtTokens.refreshToken,
            isNewUser
        };
    }

    /**
     * Cập nhật thông tin OAuth provider cho người dùng đã có
     */
    private static async updateOAuthProvider(
        user: IUser,
        provider: 'google' | 'facebook',
        userData: GoogleUserData | FacebookUserData,
        tokens: any
    ): Promise<void> {
        const providerIndex = user.authProviders.findIndex(
            p => p.provider === provider && p.providerId === userData.id
        );

        if (providerIndex !== -1) {
            user.authProviders[providerIndex] = {
                ...user.authProviders[providerIndex],
                providerEmail: userData.email,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt,
                updatedAt: new Date()
            };
        }

        await user.save();
    }

    /**
     * Thêm OAuth provider vào người dùng đã có
     */
    private static async addOAuthProvider(
        user: IUser,
        provider: 'google' | 'facebook',
        userData: GoogleUserData | FacebookUserData,
        tokens: any
    ): Promise<void> {
        user.authProviders.push({
            provider,
            providerId: userData.id,
            providerEmail: userData.email,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await user.save();
    }

    /**
     * Tạo người dùng mới từ OAuth
     */
    private static async createOAuthUser(
        userData: GoogleUserData | FacebookUserData,
        provider: 'google' | 'facebook',
        tokens: any,
        UserModel: any
    ): Promise<IUser> {
        // Tạo username duy nhất từ email hoặc tên
        const baseUsername = userData.email?.split('@')[0] || userData.name.toLowerCase().replace(/\s+/g, '');
        const username = await this.generateUniqueUsername(baseUsername, UserModel);

        // Tạo avatar URL
        let avatarUrl: string | undefined;
        if (provider === 'google') {
            avatarUrl = (userData as GoogleUserData).picture;
        } else if (provider === 'facebook') {
            avatarUrl = (userData as FacebookUserData).picture?.data?.url;
        }

        // Sinh mật khẩu ngẫu nhiên (không dùng do đăng nhập OAuth)
        const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

        const newUser = new UserModel({
            email: userData.email,
            username,
            displayName: userData.name,
            password: randomPassword,
            avatarUrl,
            isVerified: true, // Người dùng OAuth được xác thực luôn
            authProviders: [{
                provider,
                providerId: userData.id,
                providerEmail: userData.email,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt,
                createdAt: new Date(),
                updatedAt: new Date()
            }]
        });

        return await newUser.save();
    }

    /**
     * Sinh username duy nhất
     */
    private static async generateUniqueUsername(baseUsername: string, UserModel: any): Promise<string> {
        let username = baseUsername;
        let counter = 1;

        while (await UserModel.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        return username;
    }

    /**
     * Xác thực JWT token
     */
    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }
    }
}