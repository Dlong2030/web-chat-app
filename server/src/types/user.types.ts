import { Types } from 'mongoose';

export interface UserResponse {
    _id: string;
    email: string;
    username?: string;
    displayName: string;
    avatarUrl?: string;
    phoneNumber?: string;
    bio?: string;
    isActive: boolean;
    isVerified: boolean;
    lastSeen: Date;
    status: 'online' | 'away' | 'busy' | 'offline';
    theme: 'light' | 'dark' | 'auto';
    language: string;
    createdAt: Date;
    updatedAt: Date;
}