import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models';

interface AuthenticatedRequest extends Request {
    user?: any;
    userId?: string;
}

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // 1. Chỉ đọc token từ header
        let token = req.headers.authorization;
        if (!token || !token.startsWith('Bearer ')) {
            throw new Error('ACCESS_TOKEN_REQUIRED');
        }
        token = token.slice(7);

        // 2. Giải mã token
        const decoded = AuthService.verifyToken(token);
        if (!decoded?.userId) {
            throw new Error('INVALID_TOKEN_PAYLOAD');
        }

        // 3. Kiểm tra user
        const user = await User.findById(decoded.userId).select('+isActive');
        if (!user || !user.isActive) {
            throw new Error('USER_NOT_FOUND_OR_INACTIVE');
        }

        // 4. Gắn user vào request
        req.user = user;
        req.userId = user._id.toString();

        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: getErrorMessage(error.message),
            error: error.message
        });
    }
};

// Helper để trả về message
const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
        'ACCESS_TOKEN_REQUIRED': 'Access token is required',
        'INVALID_TOKEN_PAYLOAD': 'Token payload invalid',
        'USER_NOT_FOUND_OR_INACTIVE': 'User not found or inactive'
    };
    return messages[errorCode] || 'Invalid or expired token';
};

export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        } else {
            return next(); // Không có token, bỏ qua middleware
        }

        if (token) {
            try {
                const decoded = AuthService.verifyToken(token);
                if (decoded?.userId) {
                    const user = await User.findById(decoded.userId).select('+isActive');
                    if (user && user.isActive) {
                        req.user = user;
                        req.userId = user._id.toString();
                    }
                }
            } catch (error) {
                console.log('Optional auth token error:', error);
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};