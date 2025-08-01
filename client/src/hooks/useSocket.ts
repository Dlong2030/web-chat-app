import { use, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { socketService } from '../services/socketService';
import { logoutAsync } from '../store/slices/authSlices';
import { useAppDispatch } from '../store';

export const useSocket = () => {
    const dispatch = useAppDispatch();
    const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { connected, error } = useSelector((state: RootState) => state.socket);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            socketService.connect(accessToken);
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, accessToken]);

    useEffect(() => {
        if (error === 'Authentication error') {
            dispatch(logoutAsync());
        }
    }, [error, dispatch]);

    return {
        connected,
        error,
        socketService,
    };
};