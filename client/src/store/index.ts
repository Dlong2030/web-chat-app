import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlices';
import socketReducer from './slices/socket/socketSlice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import chatReducer from './slices/chat/chatSlice';
import conversationReducer from './slices/chat/conversationSlice';
import userReducer from './slices/chat/userSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        conversations: conversationReducer,
        users: userReducer,
        socket: socketReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                
            }
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;