import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IConversation } from '../../../types/chat.types';

interface ConversationState {
    conversations: IConversation[];
    loading: boolean;
    error: string | null;
}

const initialState: ConversationState = {
    conversations: [],
    loading: false,
    error: null,
};

const conversationSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<IConversation[]>) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action: PayloadAction<IConversation>) => {
            state.conversations.unshift(action.payload);
        },
        updateConversation: (state, action: PayloadAction<{ id: string; updates: Partial<IConversation> }>) => {
            const { id, updates } = action.payload;
            const index = state.conversations.findIndex(conv => conv._id === id);
            if (index !== -1) {
                state.conversations[index] = { ...state.conversations[index], ...updates };
            }
        },
        deleteConversation: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            state.conversations = state.conversations.filter(conv => conv._id !== conversationId);
        },
        addParticipant: (state, action: PayloadAction<{ conversationId: string; participant: any }>) => {
            const { conversationId, participant } = action.payload;
            const conversation = state.conversations.find(conv => conv._id === conversationId);
            if (conversation) {
                conversation.participants.push(participant);
            }
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
    setConversations,
    addConversation,
    updateConversation,
    deleteConversation,
    addParticipant,
    setLoading,
    setError,
} = conversationSlice.actions;

export default conversationSlice.reducer;