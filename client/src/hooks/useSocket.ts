import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { connectSocket } from '../store/slices/socket/scoketThunks';

export const useSocket = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const { isConnected } = useSelector((state: RootState) => state.socket);

    useEffect(() => {
        if (isAuthenticated && accessToken && !isConnected) {
            dispatch(connectSocket());
        }

        return () => {
            // Không disconnect ở đây, để duy trì kết nối khi component unmount
        };
    }, [isAuthenticated, accessToken, isConnected, dispatch]);

    return useSelector((state: RootState) => state.socket.socket);
};