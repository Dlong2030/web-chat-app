import { Socket } from 'socket.io-client';

export interface MutableSocket extends Socket {
    receiveBuffer: any[][];
    sendBuffer: any[][];
}

declare module 'socket.io-client' {
    export type MutableSocket = Socket & {
        receiveBuffer: any[][];
        sendBuffer: any[][];
    };
}

export type SocketEventHandlers = {
    [event: string]: (...args: any[]) => void;
};

export interface SocketServiceType {
    socket: Socket | null;
    connect: (token: string) => Socket;
    disconnect: () => void;
    getSocket: () => Socket | null;
}