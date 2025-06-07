import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/auth.utils';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required',
            error: 'No token provided'
        });
        return;
    }

    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET!);

        if (decoded.type !== 'access') {
            res.status(403).json({
                success: false,
                message: 'Invalid token type',
                error: 'Token is not an access token'
            });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            error: 'Token verification failed'
        });
        return;
    }
};