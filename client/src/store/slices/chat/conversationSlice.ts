import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IConversation } from '../../../types/chat.types';
import conversationService from '../../../services/conversationService';

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

export const getUserConversations = createAsyncThunk<
    IConversation[],
    string,
    { rejectValue: string }
>(
    'conversations/getUserConversations',
    async (accessToken, { rejectWithValue }) => {
        try {
            const response = await conversationService.getUserConversations(accessToken);
            return response;
        } catch (error) {
            return rejectWithValue('Failed to fetch user conversations');
        }
    }
);

const conversationSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
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
            state.conversations = state.conversations.filter(conv => conv._id !== action.payload);
        },
        addParticipant: (state, action: PayloadAction<{ conversationId: string; participant: any }>) => {
            const { conversationId, participant } = action.payload;
            const conversation = state.conversations.find(conv => conv._id === conversationId);
            if (conversation) {
                conversation.participants.push(participant);
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
                state.conversations = action.payload;
            })
            .addCase(getUserConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Something went wrong';
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
