import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { setConnected, setError, setReconnecting, incrementConnectionAttempts, resetSocket } from '../store/slices/socket/socketSlice';
import { addMessage, markMessageAsRead, addReaction, deleteMessage, setTyping } from '../store/slices/chat/chatSlice';
import { addConversation, deleteConversation, addParticipant } from '../store/slices/chat/conversationSlice';
import { updateUserStatus } from '../store/slices/chat/userSlice';
import { logoutAsync } from '../store/slices/authSlices';
import { IMessage, IConversation, ConversationResponse   } from '../types/chat.types';

class SocketService {
    private socket: Socket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private maxReconnectAttempts = 5;

    connect(accessToken: string) {
        if (this.socket?.connected) {
            return this.socket;
        }

        // Disconnect existing socket if any
        this.disconnect();

        this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
            auth: {
                token: accessToken, // Sử dụng accessToken thay vì token
            },
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.setupEventListeners();
        return this.socket;
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected');
            store.dispatch(setConnected(true));
            store.dispatch(setError(null));
            this.clearReconnectTimer();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            store.dispatch(setConnected(false));

            // Auto reconnect nếu không phải do client disconnect
            if (reason === 'io server disconnect') {
                this.handleReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            store.dispatch(setError(error.message));
            store.dispatch(incrementConnectionAttempts());

            // Nếu lỗi authentication, logout user
            if (error.message === 'Authentication error') {
                store.dispatch(logoutAsync());
                return;
            }

            this.handleReconnect();
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            store.dispatch(setConnected(true));
            store.dispatch(setReconnecting(false));
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Socket reconnect attempt:', attemptNumber);
            store.dispatch(setReconnecting(true));
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed');
            store.dispatch(setError('Connection failed. Please refresh the page.'));
            store.dispatch(setReconnecting(false));
        });

        // Message events
        this.socket.on('new_message', (message: IMessage) => {
            store.dispatch(addMessage(message));
        });

        this.socket.on('message_read', (messageId: string) => {
            const state = store.getState();
            const currentUser = state.auth.user;
            if (currentUser) {
                store.dispatch(markMessageAsRead({ messageId, userId: currentUser._id }));
            }
        });

        this.socket.on('reaction_added', (data: { messageId: string; reaction: string }) => {
            const state = store.getState();
            const currentUser = state.auth.user;
            if (currentUser) {
                store.dispatch(addReaction({
                    messageId: data.messageId,
                    userId: currentUser._id,
                    reaction: data.reaction
                }));
            }
        });

        this.socket.on('message_deleted', (messageId: string) => {
            store.dispatch(deleteMessage(messageId));
        });

        // Conversation events
        this.socket.on('conversation_created', (conversation: ConversationResponse) => {
            store.dispatch(addConversation(conversation));
        });

        this.socket.on('conversation_deleted', (conversationId: string) => {
            store.dispatch(deleteConversation(conversationId));
        });

        this.socket.on('participant_added', (data: { conversationId: string; participant: any }) => {
            store.dispatch(addParticipant(data));
        });

        this.socket.on('added_to_conversation', (conversation: ConversationResponse) => {
            store.dispatch(addConversation(conversation));
        });

        // User events
        this.socket.on('user_status_changed', (data: { userId: string; status: string }) => {
            store.dispatch(updateUserStatus(data));
        });

        // Typing events
        this.socket.on('user_typing', (data: { conversationId: string; userId: string }) => {
            const state = store.getState();
            const currentTyping = state.chat.typing[data.conversationId] || [];
            if (!currentTyping.includes(data.userId)) {
                store.dispatch(setTyping({
                    conversationId: data.conversationId,
                    userIds: [...currentTyping, data.userId]
                }));
            }
        });

        this.socket.on('user_stop_typing', (data: { conversationId: string; userId: string }) => {
            const state = store.getState();
            const currentTyping = state.chat.typing[data.conversationId] || [];
            store.dispatch(setTyping({
                conversationId: data.conversationId,
                userIds: currentTyping.filter(id => id !== data.userId)
            }));
        });

        // Call events
        this.socket.on('incoming_call', (data: { caller: any; type: string; conversationId: string }) => {
            // Handle incoming call UI
            console.log('Incoming call:', data);
        });

        this.socket.on('call_accepted', () => {
            console.log('Call accepted');
        });

        this.socket.on('call_rejected', () => {
            console.log('Call rejected');
        });

        this.socket.on('call_ended', () => {
            console.log('Call ended');
        });

        // Error events
        this.socket.on('error', (error: string) => {
            console.error('Socket error:', error);
            store.dispatch(setError(error));
        });
    }

    private handleReconnect() {
        const state = store.getState();
        if (state.socket.connectionAttempts >= this.maxReconnectAttempts) {
            store.dispatch(setError('Max reconnection attempts reached'));
            return;
        }

        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                console.log('Attempting to reconnect...');
                store.dispatch(setReconnecting(true));
                this.socket.connect();
            }
        }, 2000);
    }

    private clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // Getter cho socket instance (để sử dụng bên ngoài)
    get instance(): Socket | null {
        return this.socket;
    }

    // Check connection status
    get isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    disconnect() {
        this.clearReconnectTimer();

        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            store.dispatch(resetSocket());
        }
    }

    // Message methods
    sendMessage(data: {
        conversationId: string;
        content?: string;
        type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker';
        file?: File;
        replyTo?: string;
    }) {
        if (!this.isConnected) {
            store.dispatch(setError('Not connected to server'));
            return;
        }
        this.socket?.emit('send_message', data);
    }

    markAsRead(messageId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('mark_as_read', messageId);
    }

    reactToMessage(messageId: string, reaction: string) {
        if (!this.isConnected) return;
        this.socket?.emit('react_to_message', { messageId, reaction });
    }

    deleteMessage(messageId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('delete_message', messageId);
    }

    deleteAttachment(messageId: string, attachmentIndex: number) {
        if (!this.isConnected) return;
        this.socket?.emit('delete_attachment', { messageId, attachmentIndex });
    }

    // Conversation methods
    createConversation(data: {
        type: 'direct' | 'group';
        participantIds: string[];
        name?: string;
    }) {
        if (!this.isConnected) return;
        this.socket?.emit('create_conversation', data);
    }

    addParticipant(conversationId: string, userId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('add_participant', { conversationId, userId });
    }

    deleteConversation(conversationId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('delete_conversation', conversationId);
    }

    // User methods
    updateStatus(status: 'online' | 'offline' | 'away' | 'busy') {
        if (!this.isConnected) return;
        this.socket?.emit('update_status', status);
    }

    // Call methods
    startCall(conversationId: string, type: 'audio' | 'video') {
        if (!this.isConnected) return;
        this.socket?.emit('start_call', { conversationId, type });
    }

    acceptCall(conversationId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('accept_call', { conversationId });
    }

    rejectCall(conversationId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('reject_call', { conversationId });
    }

    endCall(conversationId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('end_call', { conversationId });
    }

    // Typing methods
    startTyping(conversationId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('typing', { conversationId });
    }

    stopTyping(conversationId: string) {
        if (!this.isConnected) return;
        this.socket?.emit('stop_typing', { conversationId });
    }

    // Manual reconnect
    reconnect() {
        if (this.socket && !this.socket.connected) {
            this.socket.connect();
        }
    }
}

export const socketService = new SocketService();