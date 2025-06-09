import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models';

/**
 * Middleware để xác thực JWT token
 */
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) token = req.cookies?.accessToken;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
            return;
        }

        const decoded = AuthService.verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }

        (req as any).user = user;
        (req as any).userId = decoded.userId;

        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
        return;
    }
};

/**
 * Middleware tùy chọn - không bắt buộc phải có token
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) token = req.cookies?.accessToken;

        if (token) {
            try {
                const decoded = AuthService.verifyToken(token);
                const user = await User.findById(decoded.userId);
                if (user && user.isActive) {
                    (req as any).user = user;
                    (req as any).userId = decoded.userId;
                }
            } catch (error) {
                console.log('Invalid token in optional auth:', error);
            }
        }

        next();
    } catch (error) {
        next();
    }
};
