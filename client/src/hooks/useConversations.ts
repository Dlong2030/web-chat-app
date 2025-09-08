import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { getUserConversations } from '../store/slices/chat/conversationSlice';

export const useConversations = (accessToken: string | null) => {
    const dispatch = useAppDispatch();
    const { chatItems, loading, error } = useAppSelector((state) => state.conversations);

    useEffect(() => {
        let isMounted = true;

        const fetchConversations = async () => {
            if (accessToken && isMounted) {
                try {
                    await dispatch(getUserConversations(accessToken)).unwrap();
                } catch (error) {
                    console.error('Failed to load conversations:', error);
                }
            }
        };

        fetchConversations();

        return () => {
            isMounted = false;
        };
    }, [dispatch, accessToken]);

    const refreshConversations = () => {
        if (accessToken) {
            dispatch(getUserConversations(accessToken));
        }
    };

    return {
        conversations: chatItems,
        loading,
        error,
        refreshConversations
    };
};