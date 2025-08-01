import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMessage } from '../../../types/chat.types';

interface ChatState {
    messages: { [conversationId: string]: IMessage[] };
    activeConversation: string | null;
    loading: boolean;
    error: string | null;
    typing: { [conversationId: string]: string[] };
}

const initialState: ChatState = {
    messages: {},
    activeConversation: null,
    loading: false,
    error: null,
    typing: {},
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversation = action.payload;
        },
        setMessages: (state, action: PayloadAction<{ conversationId: string; messages: IMessage[] }>) => {
            const { conversationId, messages } = action.payload;
            state.messages[conversationId] = messages;
        },
        addMessage: (state, action: PayloadAction<IMessage>) => {
            const message = action.payload;
            const conversationId = message.conversationId;

            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }

            state.messages[conversationId].push(message);
        },
        updateMessage: (state, action: PayloadAction<{ messageId: string; updates: Partial<IMessage> }>) => {
            const { messageId, updates } = action.payload;

            Object.keys(state.messages).forEach(conversationId => {
                const messageIndex = state.messages[conversationId].findIndex(msg => msg._id === messageId);
                if (messageIndex !== -1) {
                    state.messages[conversationId][messageIndex] = {
                        ...state.messages[conversationId][messageIndex],
                        ...updates
                    };
                }
            });
        },
        deleteMessage: (state, action: PayloadAction<string>) => {
            const messageId = action.payload;

            Object.keys(state.messages).forEach(conversationId => {
                const messageIndex = state.messages[conversationId].findIndex(msg => msg._id === messageId);
                if (messageIndex !== -1) {
                    state.messages[conversationId][messageIndex].isDeleted = true;
                    state.messages[conversationId][messageIndex].deletedAt = new Date();
                }
            });
        },
        markMessageAsRead: (state, action: PayloadAction<{ messageId: string; userId: string }>) => {
            const { messageId, userId } = action.payload;

            Object.keys(state.messages).forEach(conversationId => {
                const message = state.messages[conversationId].find(msg => msg._id === messageId);
                if (message) {
                    const existingRead = message.readBy.find(read => read.userId === userId);
                    if (!existingRead) {
                        message.readBy.push({ userId, readAt: new Date() });
                    }
                }
            });
        },
        addReaction: (state, action: PayloadAction<{ messageId: string; userId: string; reaction: string }>) => {
            const { messageId, userId, reaction } = action.payload;

            Object.keys(state.messages).forEach(conversationId => {
                const message = state.messages[conversationId].find(msg => msg._id === messageId);
                if (message) {
                    const existingReaction = message.reactions.find(r => r.userId === userId);
                    if (existingReaction) {
                        existingReaction.reaction = reaction;
                    } else {
                        message.reactions.push({ userId, reaction, createdAt: new Date() });
                    }
                }
            });
        },
        setTyping: (state, action: PayloadAction<{ conversationId: string; userIds: string[] }>) => {
            const { conversationId, userIds } = action.payload;
            state.typing[conversationId] = userIds;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setActiveConversation,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    markMessageAsRead,
    addReaction,
    setTyping,
    setLoading,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer;