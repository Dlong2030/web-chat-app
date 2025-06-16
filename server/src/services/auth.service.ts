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
    private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    /**
     * Tạo JWT tokens cho người dùng
     */
    private static generateTokens(userId: string): { accessToken: string; refreshToken: string } {
        const signOptions: SignOptions = {
            expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
        };

        const refreshSignOptions: SignOptions = {
            expiresIn: this.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
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
            const tokens = await GoogleOAuthService.exchangeCodeForTokens(code);
            const googleUser = await GoogleOAuthService.getUserInfo(tokens.accessToken);

            // Debug: log dữ liệu user nhận được
            console.log('Google user data:', {
                id: googleUser.id,
                email: googleUser.email,
                name: googleUser.name
            });

            // Xử lý trường hợp không có email
            if (!googleUser.email) {
                googleUser.email = `${googleUser.id}@google.com`;
                console.warn(`Generated email for Google user: ${googleUser.email}`);
            }

            // Tìm hoặc tạo người dùng trong cơ sở dữ liệu
            const authResult = await this.findOrCreateOAuthUser(
                googleUser,
                'google',
                tokens,
                UserModel
            );

            return authResult;
        } catch (error: any) {
            console.error('Google auth error details:', error);
            throw new AppError(`Google authentication failed: ${error.message}`, 401, 'GOOGLE_AUTH_FAILED');
        }
    }

    /**
     * Xử lý đăng nhập bằng Facebook OAuth
     */
    static async handleFacebookAuth(code: string, UserModel: any): Promise<AuthResult> {
        try {
            // Đổi code lấy access token
            const shortLivedTokens = await FacebookOAuthService.exchangeCodeForTokens(code);

            // Đổi sang token dài hạn (60 ngày)
            const tokens = await FacebookOAuthService.exchangeForLongLivedToken(shortLivedTokens.accessToken);

            // Lấy thông tin người dùng từ Facebook
            const facebookUser = await FacebookOAuthService.getUserInfo(tokens.accessToken);

            console.log('Facebook user data:', {
                id: facebookUser.id,
                email: facebookUser.email,
                name: facebookUser.name
            });

            if (!facebookUser.email) {
                facebookUser.email = `${facebookUser.id}@facebook.com`;
                console.warn(`Generated email for Facebook user: ${facebookUser.email}`);
            }

            // Tìm hoặc tạo người dùng trong cơ sở dữ liệu
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

        // Validate required fields
        if (!userData.id) {
            throw new AppError(`${provider} user id is missing`, 400, 'OAUTH_ID_MISSING');
        }

        // Handle missing email
        if (!userData.email) {
            userData.email = `${userData.id}@${provider}.com`;
            console.warn(`Generated email for ${provider} user: ${userData.email}`);
        }

        // Try to find user by providerId first
        user = await UserModel.findOne({
            'authProviders.provider': provider,
            'authProviders.providerId': userData.id
        });

        if (user) {
            // User exists - update provider info
            console.log(`Found existing ${provider} user: ${user.email}`);
            await this.updateOAuthProvider(user, provider, userData, tokens);
        } else {
            // Try to find by email (in case user signed up with other method)
            if (userData.email) {
                user = await UserModel.findOne({ email: userData.email.toLowerCase() });
            }

            if (user) {
                // User exists with same email - add new provider
                console.log(`Adding ${provider} auth to existing user: ${user.email}`);
                await this.addOAuthProvider(user, provider, userData, tokens);
            } else {
                // Create completely new user
                console.log(`Creating new user from ${provider} auth`);
                try {
                    user = await this.createOAuthUser(userData, provider, tokens, UserModel);
                    isNewUser = true;
                } catch (error) {
                    console.error('Error creating OAuth user:', error);
                    throw new AppError(
                        `Failed to create ${provider} user: ${"error.message"}`,
                        500,
                        'USER_CREATION_FAILED'
                    );
                }
            }
        }

        // Generate tokens
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
        try {
            const providerIndex = user.authProviders.findIndex(
                p => p.provider === provider && p.providerId === userData.id
            );

            if (providerIndex !== -1) {
                // Tạo bản sao mới để không làm mất dữ liệu gốc
                const updatedProvider = {
                    ...user.authProviders[providerIndex],
                    providerEmail: userData.email,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresAt: tokens.expiresAt,
                    updatedAt: new Date()
                };

                // Đảm bảo giữ nguyên các trường bắt buộc
                updatedProvider.provider = provider;
                updatedProvider.providerId = userData.id;

                user.authProviders[providerIndex] = updatedProvider;
            } else {
                // Nếu không tìm thấy, thêm provider mới
                console.warn(`Provider not found, adding new for user ${user.email}`);
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
            }

            await user.save();
        } catch (error) {
            console.error('Error updating OAuth provider:', error);
            throw error;
        }
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
        try {
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
        } catch (error) {
            console.error('Error adding OAuth provider:', error);
            throw error;
        }
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
        const displayName = userData.name || userData.email.split('@')[0] || 'User';

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
            displayName,
            password: randomPassword,
            avatarUrl,
            isVerified: true,
            authProviders: [{
                provider,
                providerId: userData.id,
                providerEmail: userData.email,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt,
                createdAt: new Date(),
                updatedAt: new Date()
            }],
            isActive: true,
            status: 'online',
            theme: 'light',
            language: 'vi',
            notificationSettings: {
                soundEnabled: true,
                vibrationEnabled: true,
                globalMute: false
            }
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

    static async getUserFromToken(token: string): Promise<IUser> {
        const decoded = this.verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.isActive) {
            throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }

        return user;
    }
}