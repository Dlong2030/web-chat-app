import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ConversationResponse } from '../../../types/chat.types';
import conversationService from '../../../services/conversationService';

interface ConversationState {
    chatItems: ConversationResponse[];
    loading: boolean;
    error: string | null;
}

const initialState: ConversationState = {
    chatItems: [], // Tên đúng là chatItems
    loading: false,
    error: null,
};

export const getUserConversations = createAsyncThunk<
    ConversationResponse[],
    string,
    { rejectValue: string }
>(
    'conversations/getUserConversations',
    async (accessToken, { rejectWithValue }) => {
        try {
            return await conversationService.getUserConversations(accessToken);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const conversationSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
        addConversation: (state, action: PayloadAction<ConversationResponse>) => {
            state.chatItems.unshift(action.payload); 
        },
        updateConversation: (state, action: PayloadAction<{ id: string; updates: Partial<ConversationResponse> }>) => {
            const { id, updates } = action.payload;
            const index = state.chatItems.findIndex(conv => conv.conversation._id === id); 
            if (index !== -1) {
                state.chatItems[index] = { ...state.chatItems[index], ...updates }; 
            }
        },
        deleteConversation: (state, action: PayloadAction<string>) => {
            state.chatItems = state.chatItems.filter(conv => conv.conversation._id !== action.payload); 
        },
        addParticipant: (state, action: PayloadAction<{ conversationId: string; participant: any }>) => {
            const { conversationId, participant } = action.payload;
            const conversation = state.chatItems.find(conv => conv.conversation._id === conversationId); 
            if (conversation) {
                conversation.conversation.participants.push(participant); 
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.chatItems = action.payload;
            })
            .addCase(getUserConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load conversations';
                state.chatItems = [];
            });
    }
});

export const {
    addConversation,
    updateConversation,
    deleteConversation,
    addParticipant
} = conversationSlice.actions;

export default conversationSlice.reducer;