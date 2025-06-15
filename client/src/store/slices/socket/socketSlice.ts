import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MutableSocket } from '../../../types/socket'; 

interface SocketState {
    socket: MutableSocket | null;
    isConnected: boolean;
    error: string | null;
}

const initialState: SocketState = {
    socket: null,
    isConnected: false,
    error: null,
};

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        setSocket: (state, action: PayloadAction<MutableSocket | null>) => {
            state.socket = action.payload;
        },
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setSocket, setConnected, setError } = socketSlice.actions;
export default socketSlice.reducer;