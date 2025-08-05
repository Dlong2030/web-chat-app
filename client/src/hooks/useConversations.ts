import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { getUserConversations } from '../store/slices/chat/conversationSlice';

export const useConversations = (accessToken: string | null) => {
    const dispatch = useAppDispatch();
    const conversations = useAppSelector((state) => state.conversations.conversations);
    const loading = useAppSelector((state) => state.conversations.loading);
    const error = useAppSelector((state) => state.conversations.error);

    useEffect(() => {
        if (accessToken) {
            dispatch(getUserConversations(accessToken));
        }
    }, [dispatch, accessToken]);

    return {
        conversations,
        loading,
        error,
    };
};
