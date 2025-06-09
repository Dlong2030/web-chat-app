import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { GoogleOAuthService } from '../services/google-oauth.service';
import { FacebookOAuthService } from '../services/facebook-oauth.service';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';
import { User } from '../models';


export class AuthController {
    /**
     * POST /auth/register
     * Đăng ký tài khoản mới
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            // Validation errors check
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: errors.array().map(err => err.msg).join(', ')
                });
                return;
            }

            const result = await AuthService.registerUser(req.body as RegisterRequest);

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: result
            });

        } catch (error: any) {
            console.error('Registration error:', error);

            switch (error.code) {
                case 'USER_EXISTS':
                    res.status(409).json({
                        success: false,
                        message: 'User already exists',
                        error: 'An account with this email already exists'
                    });
                    break;
                case 'USERNAME_TAKEN':
                    res.status(409).json({
                        success: false,
                        message: 'Username already taken',
                        error: 'This username is already in use'
                    });
                    break;
                default:
                    res.status(500).json({
                        success: false,
                        message: 'Internal server error',
                        error: 'Failed to create account'
                    });
                    break;
            }
        }
    }

    /**
     * POST /auth/login
     * Đăng nhập tài khoản
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            // Validation errors check
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: errors.array().map(err => err.msg).join(', ')
                });
                return;
            }

            const result = await AuthService.loginUser(req.body as LoginRequest);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });

        } catch (error: any) {
            console.error('Login error:', error);

            switch (error.code) {
                case 'INVALID_CREDENTIALS':
                    res.status(401).json({
                        success: false,
                        message: 'Invalid credentials',
                        error: 'Email or password is incorrect'
                    });
                    break;
                case 'ACCOUNT_DISABLED':
                    res.status(403).json({
                        success: false,
                        message: 'Account disabled',
                        error: 'Your account has been disabled. Please contact support.'
                    });
                    break;
                default:
                    res.status(500).json({
                        success: false,
                        message: 'Internal server error',
                        error: 'Failed to login'
                    });
                    break;
            }
        }
    }

    /**
     * POST /auth/refresh
     * Làm mới access token
     */
    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: errors.array().map(err => err.msg).join(', ')
                });
                return;
            }

            const { refreshToken } = req.body;
            const result = await AuthService.refreshUserToken(refreshToken);

            res.status(200).json({
                success: true,
                message: 'Tokens refreshed successfully',
                data: result
            });

        } catch (error: any) {
            console.error('Refresh token error:', error);

            const errorMessage = error.code === 'INVALID_TOKEN_TYPE' ?
                'Token is not a refresh token' : 'Invalid or expired refresh token';

            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                error: errorMessage
            });
        }
    }

    /**
     * POST /auth/logout
     * Đăng xuất tài khoản
     */
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            const { deviceToken } = req.body;
            const userId = (req as any).userId; // From auth middleware

            await AuthService.logoutUser(userId, deviceToken);

            // Xóa cookies nếu có
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'Failed to logout'
            });
        }
    }

    /**
     * GET /auth/me
     * Lấy thông tin user hiện tại
     */
    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            // Middleware sẽ attach user vào req
            const user = (req as any).user;

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            res.json({
                success: true,
                data: user.toPublicJSON()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to get user info',
                error: error.message
            });
        }
    }

    // ===== OAUTH METHODS =====

    /**
     * GET /auth/google
     * Redirect user đến Google OAuth
     */
    static initiateGoogleAuth = (req: Request, res: Response): void => {
        try {
            const state = req.query.state as string;
            const authUrl = GoogleOAuthService.getAuthUrl(state);
            res.redirect(authUrl);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to initiate Google authentication',
                error: error.message
            });
        }
    };

    /**
     * GET /auth/google/callback
     * Xử lý callback từ Google OAuth
     */
    static handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { code, error, state } = req.query;

            // Kiểm tra lỗi từ Google
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Google authentication failed',
                    error: error as string
                });
                return;
            }

            // Kiểm tra authorization code
            if (!code) {
                res.status(400).json({
                    success: false,
                    message: 'Authorization code is required'
                });
                return;
            }

            // Xử lý authentication
            const authResult = await AuthService.handleGoogleAuth(code as string, User);

            // Set JWT token vào cookie (tùy chọn)
            res.cookie('accessToken', authResult.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'development',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            res.cookie('refreshToken', authResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'development',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
            });

            // Redirect về frontend với thông tin user
            const redirectUrl = new URL(process.env.CLIENT_URL || 'http://localhost:3000');
            redirectUrl.searchParams.set('auth', 'success');
            redirectUrl.searchParams.set('newUser', authResult.isNewUser.toString());
            if (typeof state === 'string') {
                redirectUrl.searchParams.set('state', state);
            }


            res.redirect(redirectUrl.toString());

            // Tạm thời trả về JSON response để test
            res.json({
                success: true,
                message: 'Google authentication successful',
                data: {
                    code: code,
                    state: state
                }
            });
        } catch (error: any) {
            console.error('Google auth callback error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during Google authentication',
                error: error.message
            });
        }
    };

    /**
     * GET /auth/facebook
     * Redirect user đến Facebook OAuth
     */
    static initiateFacebookAuth = (req: Request, res: Response): void => {
        try {
            const state = req.query.state as string;
            const authUrl = FacebookOAuthService.getAuthUrl(state);
            res.redirect(authUrl);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to initiate Facebook authentication',
                error: error.message
            });
        }
    };

    /**
     * GET /auth/facebook/callback
     * Xử lý callback từ Facebook OAuth
     */
    static handleFacebookCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { code, error, state } = req.query;

            // Kiểm tra lỗi từ Facebook
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Facebook authentication failed',
                    error: error as string
                });
                return;
            }

            // Kiểm tra authorization code
            if (!code) {
                res.status(400).json({
                    success: false,
                    message: 'Authorization code is required'
                });
                return;
            }

            // Xử lý authentication
            const authResult = await AuthService.handleFacebookAuth(code as string, User);

            // Set JWT token vào cookie (tùy chọn)
            res.cookie('accessToken', authResult.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'development',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            res.cookie('refreshToken', authResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'development',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
            });

            // Redirect về frontend với thông tin user
            const redirectUrl = new URL(process.env.CLIENT_URL || 'http://localhost:3000');
            redirectUrl.searchParams.set('auth', 'success');
            redirectUrl.searchParams.set('newUser', authResult.isNewUser.toString());
            if (typeof state === 'string') {
                redirectUrl.searchParams.set('state', state);
            }


            res.redirect(redirectUrl.toString());

            // Tạm thời trả về JSON response để test
            res.json({
                success: true,
                message: 'Facebook authentication successful',
                data: {
                    code: code,
                    state: state
                }
            });
        } catch (error: any) {
            console.error('Facebook auth callback error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during Facebook authentication',
                error: error.message
            });
        }
    };
}