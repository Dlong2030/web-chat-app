import { Schema, Document, Types } from 'mongoose';

// Interfaces
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

export interface IReaction {
    userId: Types.ObjectId;
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | 'care';
    createdAt: Date;
}

export interface IReadBy {
    userId: Types.ObjectId;
    readAt: Date;
}

export interface IReplyTo {
    messageId: Types.ObjectId;
    content?: string;
    senderId?: Types.ObjectId;
    type?: string;
}

export interface IForwardedFrom {
    messageId: Types.ObjectId;
    originalSenderId?: Types.ObjectId;
    originalConversationId?: Types.ObjectId;
}

export interface IEditHistory {
    content?: string;
    editedAt: Date;
}

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    content?: string;
    type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker' | 'location' | 'system';
    replyTo?: IReplyTo;
    forwardedFrom?: IForwardedFrom;
    attachments: IAttachment[];
    reactions: IReaction[];
    readBy: IReadBy[];
    mentions: Types.ObjectId[];
    isEdited: boolean;
    editedAt?: Date;
    editHistory: IEditHistory[];
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    addReaction(userId: Types.ObjectId, reactionType: string): Promise<IMessage>;
    removeReaction(userId: Types.ObjectId): Promise<IMessage>;
    markAsRead(userId: Types.ObjectId): Promise<IMessage>;
    editContent(newContent: string): Promise<IMessage>;
}

// Schema
const attachmentSchema = new Schema<IAttachment>({
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: String,
    fileSize: Number,
    thumbnailUrl: String,
    duration: Number,
    width: Number,
    height: Number
}, { _id: false });

const reactionSchema = new Schema<IReaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'care'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const readBySchema = new Schema<IReadBy>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    readAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const replyToSchema = new Schema<IReplyTo>({
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    content: String,
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: String
}, { _id: false });

const forwardedFromSchema = new Schema<IForwardedFrom>({
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    originalSenderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    originalConversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation'
    }
}, { _id: false });

const editHistorySchema = new Schema<IEditHistory>({
    content: String,
    editedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// MAIN MESSAGE SCHEMA
export const messageSchema = new Schema<IMessage>({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: String,
    type: {
        type: String,
        enum: ['text', 'image', 'voice', 'video', 'file', 'sticker', 'location', 'system'],
        required: true,
        default: 'text'
    },
    replyTo: replyToSchema,
    forwardedFrom: forwardedFromSchema,
    attachments: [attachmentSchema],
    reactions: [reactionSchema],
    readBy: [readBySchema],
    mentions: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    editHistory: [editHistorySchema],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// INDEXES
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ 'replyTo.messageId': 1 });
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ content: 'text', 'attachments.fileName': 'text' });

// METHODS
messageSchema.methods.addReaction = function (
    this: IMessage,
    userId: Types.ObjectId,
    reactionType: string
): Promise<IMessage> {
    // Remove existing reaction from this user
    this.reactions = this.reactions.filter(r =>
        r.userId.toString() !== userId.toString()
    );
    // Add new reaction
    this.reactions.push({
        userId,
        type: reactionType as any,
        createdAt: new Date()
    });
    return this.save();
};

messageSchema.methods.removeReaction = function (
    this: IMessage,
    userId: Types.ObjectId
): Promise<IMessage> {
    this.reactions = this.reactions.filter(r =>
        r.userId.toString() !== userId.toString()
    );
    return this.save();
};

messageSchema.methods.markAsRead = function (
    this: IMessage,
    userId: Types.ObjectId
): Promise<IMessage> {
    const existingRead = this.readBy.find(r =>
        r.userId.toString() === userId.toString()
    );
    if (!existingRead) {
        this.readBy.push({
            userId,
            readAt: new Date()
        });
        return this.save();
    }
    return Promise.resolve(this);
};

messageSchema.methods.editContent = function (
    this: IMessage,
    newContent: string
): Promise<IMessage> {
    // Save to edit history
    if (this.content) {
        this.editHistory.push({
            content: this.content,
            editedAt: this.editedAt || this.createdAt
        });
    }

    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    return this.save();
};

messageSchema.methods.softDelete = function (
    this: IMessage,
    deletedBy: Types.ObjectId
): Promise<IMessage> {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    return this.save();
};