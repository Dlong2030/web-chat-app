import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (userId: string) => {
    const accessTokenPayload: TokenPayload = { userId, type: 'access' };
    const refreshTokenPayload: TokenPayload = { userId, type: 'refresh' };

    const token = jwt.sign(
        accessTokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        refreshTokenPayload,
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
    );

    return { token, refreshToken };
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
    return jwt.verify(token, secret) as TokenPayload;
};