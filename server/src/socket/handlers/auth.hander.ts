import { Socket } from 'socket.io';
import { AuthService } from '../../services/auth.service';
import { IUser, User } from '../../models';

export const authenticateSocket = async (socket: Socket, next: (err?: any) => void) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        // Sử dụng AuthService để lấy thông tin người dùng từ token
        const user = await AuthService.getUserFromToken(token);
        socket.data.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
};