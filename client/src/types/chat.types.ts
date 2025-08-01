export interface IMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    content?: string;
    type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker';
    attachments: IAttachment[];
    replyTo?: { messageId: string };
    reactions: IReaction[];
    readBy: { userId: string; readAt: Date }[];
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAttachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    publicId: string;
    resourceType: string;
}

export interface IReaction {
    userId: string;
    reaction: string;
    createdAt: Date;
}

export interface IConversation {
    _id: string;
    type: 'direct' | 'group';
    participants: IParticipant[];
    name?: string;
    lastMessage?: IMessage;
    createdBy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IParticipant {
    userId: string;
    role: 'admin' | 'member';
    joinedAt: Date;
}