import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../types/auth.types';

interface UserState {
    users: { [userId: string]: User };
    onlineUsers: string[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: {},
    onlineUsers: [],
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            const users = action.payload;
            state.users = users.reduce((acc, user) => {
                acc[user._id] = user;
                return acc;
            }, {} as { [userId: string]: User });
        },
        updateUser: (state, action: PayloadAction<User>) => {
            const user = action.payload;
            state.users[user._id] = user;
        },
        updateUserStatus: (state, action: PayloadAction<{ userId: string; status: string }>) => {
            const { userId, status } = action.payload;
            if (state.users[userId]) {
                state.users[userId].status = status as any;
            }
        },
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
        addOnlineUser: (state, action: PayloadAction<string>) => {
            if (!state.onlineUsers.includes(action.payload)) {
                state.onlineUsers.push(action.payload);
            }
        },
        removeOnlineUser: (state, action: PayloadAction<string>) => {
            state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
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
    setUsers,
    updateUser,
    updateUserStatus,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setLoading,
    setError,
} = userSlice.actions;

export default userSlice.reducer;