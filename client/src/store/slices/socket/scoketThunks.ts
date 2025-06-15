import { AppDispatch, RootState } from '../../index';
import { setSocket, setConnected, setError } from './socketSlice';
import io from 'socket.io-client';
import type { MutableSocket } from '../../../types/socket'; 

export const connectSocket = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const token = getState().auth.accessToken;
    if (!token) {
        dispatch(setError('No authentication token available'));
        return;
    }

    try {
        // Tạo socket và ép kiểu sang MutableSocket
        const socket = io(process.env.REACT_APP_SOCKET_SERVER_URL as string, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        }) as unknown as MutableSocket; // Ép kiểu quan trọng ở đây

        // "Sửa" các buffer thành mutable arrays
        socket.receiveBuffer = [...(socket.receiveBuffer as any)] as any[][];
        socket.sendBuffer = [...(socket.sendBuffer as any)] as any[][];

        dispatch(setSocket(socket));

        socket.on('connect', () => {
            dispatch(setConnected(true));
            dispatch(setError(null));
        });

        socket.on('disconnect', () => {
            dispatch(setConnected(false));
        });

        socket.on('connect_error', (err: Error) => {
            dispatch(setError(err.message));
        });
    } catch (error) {
        dispatch(setError('Failed to connect to socket server'));
    }
};

export const disconnectSocket = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const socket = getState().socket.socket;
    if (socket) {
        socket.disconnect();
        dispatch(setSocket(null));
        dispatch(setConnected(false));
    }
};