import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlices';
import socketReducer from './slices/socket/socketSlice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import chatReducer from './slices/chat/chatSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        socket: socketReducer,
        chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'socket/setSocket'
                ],
                ignoredPaths: [
                    'socket.socket',
                    'socket.socket.receiveBuffer',
                    'socket.socket.sendBuffer'
                ],
            },
            immutableCheck: {
                ignoredPaths: [
                    'socket.socket',
                    'socket.socket.receiveBuffer',
                    'socket.socket.sendBuffer'
                ]
            }
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;