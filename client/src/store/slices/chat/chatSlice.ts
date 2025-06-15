import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMessage } from '../../../types/message.types';

interface ChatState {
    messages: IMessage[];
    currentConversationId: string | null;
}

const initialState: ChatState = {
    messages: [],
    currentConversationId: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentConversation: (state, action: PayloadAction<string>) => {
            state.currentConversationId = action.payload;
        },
        addMessage: (state, action: PayloadAction<IMessage>) => {
            state.messages.push(action.payload);
        },
        deleteMessage: (state, action: PayloadAction<string>) => {
            const index = state.messages.findIndex(msg =>
                msg._id.toString() === action.payload
            );
            if (index !== -1) {
                state.messages[index].isDeleted = true;
            }
        },
        clearMessages: (state) => {
            state.messages = [];
        },
    },
});

export const { setCurrentConversation, addMessage, deleteMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;