import { AppDispatch, RootState } from '../../index';
import { addMessage, deleteMessage } from './chatSlice';

export const listenToSocketEvents = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const socket = getState().socket.socket;
    if (!socket) return;

    // Lắng nghe tin nhắn mới
    socket.on('new_message', (message: any) => {
        dispatch(addMessage(message));
    });

    // Lắng nghe sự kiện xoá tin nhắn
    socket.on('message_deleted', (messageId: string) => {
        dispatch(deleteMessage(messageId));
    });

    // Lắng nghe thay đổi trạng thái người dùng
    socket.on('user_status_changed', (data: { userId: string; status: string }) => {
        // Xử lý nếu cần
    });
};

export const sendTextMessage = (content: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const socket = getState().socket.socket;
    const conversationId = getState().chat.currentConversationId;

    if (!socket || !conversationId || !content.trim()) return;

    socket.emit('send_message', {
        conversationId,
        content,
        type: 'text'
    });
};