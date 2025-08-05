import { Types } from 'mongoose';
import { IParticipant, ILastMessage, IConversationSettings } from '../models/schemas/conversationSchema';

// Các interface cho frontend (dùng trong API response)
export interface ParticipantResponse {
    userId: string;
    role: string;
    joinedAt: Date;
    leftAt?: Date;
    isMuted: boolean;
    muteUntil?: Date;
    nickname?: string;
    lastReadAt: Date;
    unreadCount: number;
}

export interface ReadByResponse {
    userId: string;
    readAt: Date;
}

export interface ConversationResponse {
    _id: string;
    type: 'direct' | 'group';
    participants: ParticipantResponse[];
    name?: string;
    lastMessage?: LastMessageResponse;
    createdBy?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OtherParticipantResponse {
    _id: string;
    displayName: string;
    avatarUrl?: string;
    status: string;
    lastSeen?: Date;
    username?: String;
}

export interface LastMessageResponse {
    _id: string;
    conversationId: string;
    senderId: string;
    content?: string;
    type: string;
    readBy: {
        userId: string;
        readAt: Date;
    }[];
    createdAt: Date;
}

export interface ChatItemResponse {
    conversation: ConversationResponse;
    otherParticipant?: OtherParticipantResponse;
    unreadCount: number;
    lastActivity: Date;
    isOnline: boolean;
    isTyping: boolean;
}

// Các interface cho service/socket
export interface IMessage {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    content?: string;
    type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker' | 'location' | 'system';
    readBy: {
        userId: Types.ObjectId;
        readAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversation {
    _id: Types.ObjectId;
    type: 'direct' | 'group';
    name?: string;
    participants: IParticipant[];
    lastMessage?: ILastMessage;
    createdBy?: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    settings: IConversationSettings;
}

// Types cho socket events
export interface NewMessageEvent {
    conversationId: string;
    message: LastMessageResponse;
}

export interface TypingStatusEvent {
    conversationId: string;
    userId: string;
    isTyping: boolean;
}

export interface MessageReadEvent {
    messageId: string;
    userId: string;
    readAt: Date;
}

export interface UserStatusChangedEvent {
    userId: string;
    status: 'online' | 'away' | 'busy' | 'offline';
}

// Response type cho API
export interface ConversationsResponse {
    success: boolean;
    data: ChatItemResponse[];
}