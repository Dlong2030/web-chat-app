import { Server } from 'socket.io';
import http from 'http';
import { authenticateSocket } from './handlers/auth.hander';
import { registerMessageHandlers } from './handlers/message.hander';
import { registerConversationHandlers } from './handlers/conversation.handler';
import { registerUserHandlers } from './handlers/user.handler';
import { IUser } from '../models';
import { User } from '../models';


export const initializeSocket = (server: http.Server) => {
    const port = process.env.SERVER_PORT || 5000;
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    console.log(`Socket.IO server initialized on port ${port}`);

    // Middleware xác thực
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.data.user?.displayName}`);

        // Tham gia vào các room của người dùng
        socket.join(socket.data.user._id.toString());

        // Đăng ký các handler
        registerMessageHandlers(socket);
        registerConversationHandlers(socket);
        registerUserHandlers(socket);

        // Xử lý ngắt kết nối
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.user?.displayName}`);
            // Cập nhật trạng thái offline
            if (socket.data.user) {
                User.findByIdAndUpdate(socket.data.user._id, {
                    status: 'offline',
                    lastSeen: new Date()
                }).exec();
            }
        });
    });

    return io;
};