import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';

export class AuthController {
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

            switch (error.message) {
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

            switch (error.message) {
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

            const errorMessage = error.message === 'INVALID_TOKEN_TYPE' ?
                'Token is not a refresh token' : 'Invalid or expired refresh token';

            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                error: errorMessage
            });
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        try {
            const { deviceToken } = req.body;
            const userId = (req as any).userId; // From auth middleware

            await AuthService.logoutUser(userId, deviceToken);

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
}