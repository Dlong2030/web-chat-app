import { User } from '../models';
import { IUser } from '../models';
import { RegisterRequest, LoginRequest } from '../types/auth.types';
import { hashPassword, comparePassword, generateTokens, verifyToken } from '../utils/auth.utils';

export class AuthService {
    static async registerUser(userData: RegisterRequest) {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }

        // Check username uniqueness if provided
        if (userData.username) {
            const existingUsername = await User.findOne({ username: userData.username });
            if (existingUsername) {
                throw new AppError('Username is already taken', 400, 'USERNAME_TAKEN');
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(userData.password);

        // Create user data
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

        // Add device if provided
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

        // Create and save user
        const user = new User(newUserData);
        await user.save();
        await user.updateLastSeen();

        // Generate tokens
        const tokens = generateTokens(user._id.toString());

        return {
            user: user.toPublicJSON(),
            ...tokens
        };
    }

    static async loginUser(loginData: LoginRequest) {
        // Find user by email and include password field
        const user = await User.findOne({ email: loginData.email.toLowerCase() }).select('+password');
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError('Account disabled', 403, 'ACCOUNT_DISABLED');
        }

        // Verify password
        const isPasswordValid = await comparePassword(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Add/update device if provided
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

        // Update last seen and status
        await user.updateLastSeen();

        // Generate tokens
        const tokens = generateTokens(user._id.toString());

        return {
            user: user.toPublicJSON(),
            ...tokens
        };
    }

    static async refreshUserToken(refreshToken: string) {
        // Verify refresh token
        const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);

        if (decoded.type !== 'refresh') {
            throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }

        // Generate new tokens
        const tokens = generateTokens(user._id.toString());

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
}

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