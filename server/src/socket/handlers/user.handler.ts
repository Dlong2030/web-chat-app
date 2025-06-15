import { Socket } from 'socket.io';
import { IUser, User } from '../../models';

export const registerUserHandlers = (socket: Socket) => {
    // Cập nhật trạng thái online
    socket.on('update_status', async (status: 'online' | 'offline' | 'away' | 'busy') => {
        try {
            const user = socket.data.user as IUser;
            await User.findByIdAndUpdate(user._id, {
                status,
                lastSeen: status === 'offline' ? new Date() : undefined
            });

            // Broadcast trạng thái mới
            socket.broadcast.emit('user_status_changed', {
                userId: user._id,
                status
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    });

    // Gọi điện thoại
    socket.on('start_call', (data: {
        conversationId: string;
        type: 'audio' | 'video';
    }) => {
        const { conversationId, type } = data;
        socket.to(conversationId).emit('incoming_call', {
            caller: socket.data.user,
            type,
            conversationId
        });
    });

    // Chấp nhận cuộc gọi
    socket.on('accept_call', (data: { conversationId: string }) => {
        socket.to(data.conversationId).emit('call_accepted');
    });

    // Từ chối cuộc gọi
    socket.on('reject_call', (data: { conversationId: string }) => {
        socket.to(data.conversationId).emit('call_rejected');
    });

    // Kết thúc cuộc gọi
    socket.on('end_call', (data: { conversationId: string }) => {
        socket.to(data.conversationId).emit('call_ended');
    });
};