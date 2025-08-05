export interface SocketUser {
    userId: string;
    socketId: string;
    status: 'online' | 'away' | 'busy' | 'offline';
}

export interface SocketConversationRoom {
    conversationId: string;
    userIds: string[];
}

export interface SocketAuth {
    token: string;
}

export interface SocketError {
    message: string;
    code?: string;
}