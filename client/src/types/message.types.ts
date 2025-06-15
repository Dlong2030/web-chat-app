import { Types } from 'mongoose';

export interface IAttachment {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw';
}

export interface IMessage {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    content?: string;
    type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker';
    attachments: IAttachment[];
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}