import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SocketState {
    connected: boolean;
    error: string | null;
    reconnecting: boolean;
    connectionAttempts: number;
}

const initialState: SocketState = {
    connected: false,
    error: null,
    reconnecting: false,
    connectionAttempts: 0,
};

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload;
            if (action.payload) {
                state.error = null;
                state.reconnecting = false;
                state.connectionAttempts = 0;
            }
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setReconnecting: (state, action: PayloadAction<boolean>) => {
            state.reconnecting = action.payload;
        },
        incrementConnectionAttempts: (state) => {
            state.connectionAttempts += 1;
        },
        resetConnectionAttempts: (state) => {
            state.connectionAttempts = 0;
        },
        resetSocket: (state) => {
            state.connected = false;
            state.error = null;
            state.reconnecting = false;
            state.connectionAttempts = 0;
        },
    },
});

export const {
    setConnected,
    setError,
    setReconnecting,
    incrementConnectionAttempts,
    resetConnectionAttempts,
    resetSocket
} = socketSlice.actions;
export default socketSlice.reducer;