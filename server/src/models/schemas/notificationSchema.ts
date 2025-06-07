import { Schema, Document } from 'mongoose';

// =============================================
// INTERFACE
// =============================================

export interface INotification extends Document {
    userId: Schema.Types.ObjectId;
    type: 'message' | 'friend_request' | 'mention' | 'group_invite' | 'system';
    title: string;
    content?: string;
    data: Record<string, any>;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;

    // Methods
    markAsRead(): Promise<INotification>;
}

// =============================================
// NOTIFICATION SCHEMA
// =============================================

export const notificationSchema = new Schema<INotification>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'friend_request', 'mention', 'group_invite', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 255
    },
    content: String,
    data: {
        type: Schema.Types.Mixed,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// =============================================
// INDEXES
// =============================================

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// =============================================
// METHODS
// =============================================

notificationSchema.methods.markAsRead = function (this: INotification): Promise<INotification> {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};