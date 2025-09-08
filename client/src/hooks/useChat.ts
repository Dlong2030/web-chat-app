import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setActiveConversation } from '../store/slices/chat/chatSlice';
import { socketService } from '../services/socketService';

export const useChat = () => {
    const dispatch = useDispatch();
    const chat = useSelector((state: RootState) => state.chat);
    const conversations = useSelector((state: RootState) => state);
    const users = useSelector((state: RootState) => state.users);

    const sendMessage = (data: {
        conversationId: string;
        content?: string;
        type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker';
        file?: File;
        replyTo?: string;
    }) => {
        socketService.sendMessage(data);
    };

    const setActive = (conversationId: string | null) => {
        dispatch(setActiveConversation(conversationId));
    };

    const markAsRead = (messageId: string) => {
        socketService.markAsRead(messageId);
    };

    const reactToMessage = (messageId: string, reaction: string) => {
        socketService.reactToMessage(messageId, reaction);
    };

    const deleteMessage = (messageId: string) => {
        socketService.deleteMessage(messageId);
    };

    return {
        ...chat,
        conversations: conversations.conversations,
        users: users.users,
        sendMessage,
        setActive,
        markAsRead,
        reactToMessage,
        deleteMessage,
    };
};