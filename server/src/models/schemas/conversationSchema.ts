import { Schema, Document, Types } from 'mongoose';

// =============================================
// SUBDOCUMENT INTERFACES
// =============================================

export interface IParticipant {
    userId: Schema.Types.ObjectId;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
    leftAt?: Date;
    isMuted: boolean;
    muteUntil?: Date;
    nickname?: string;
    lastReadAt: Date;
    unreadCount: number;
}

export interface ILastMessage {
    messageId?: Schema.Types.ObjectId;
    content?: string;
    senderId?: Schema.Types.ObjectId;
    type?: string;
    createdAt?: Date;
}

export interface IConversationSettings {
    allowInvites: boolean;
    showMembersList: boolean;
    allowMemberMessages: boolean;
}

export interface IConversation extends Document {
    type: 'direct' | 'group';
    name?: string;
    description?: string;
    avatarUrl?: string;
    createdBy?: Schema.Types.ObjectId;
    isActive: boolean;
    lastMessageAt?: Date;
    lastMessage?: ILastMessage;
    participants: IParticipant[];
    settings: IConversationSettings;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    addParticipant(userId: Schema.Types.ObjectId, role?: 'admin' | 'moderator' | 'member'): Promise<IConversation>;
    removeParticipant(userId: Schema.Types.ObjectId): Promise<IConversation>;
    updateLastMessage(message: any): Promise<IConversation>;
}

// =============================================
// SUBDOCUMENT SCHEMAS
// =============================================

const participantSchema = new Schema<IParticipant>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: Date,
    isMuted: {
        type: Boolean,
        default: false
    },
    muteUntil: Date,
    nickname: {
        type: String,
        maxlength: 100
    },
    lastReadAt: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Number,
        default: 0
    }
}, { _id: false });

const lastMessageSchema = new Schema<ILastMessage>({
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    content: String,
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: String,
    createdAt: Date
}, { _id: false });

const conversationSettingsSchema = new Schema<IConversationSettings>({
    allowInvites: {
        type: Boolean,
        default: true
    },
    showMembersList: {
        type: Boolean,
        default: true
    },
    allowMemberMessages: {
        type: Boolean,
        default: true
    }
}, { _id: false });

// =============================================
// MAIN CONVERSATION SCHEMA
// =============================================

export const conversationSchema = new Schema<IConversation>({
    type: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    name: {
        type: String,
        maxlength: 100
    },
    description: String,
    avatarUrl: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastMessageAt: Date,
    lastMessage: lastMessageSchema,
    participants: {
        type: [participantSchema],
        required: true,
        validate: {
            validator: function (participants: IParticipant[]) {
                return participants.length >= 2;
            },
            message: 'Conversation must have at least 2 participants'
        }
    },
    settings: {
        type: conversationSettingsSchema,
        default: () => ({})
    }
}, {
    timestamps: true
});

// =============================================
// INDEXES
// =============================================

conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });

// =============================================
// METHODS
// =============================================

conversationSchema.methods.addParticipant = function (
    this: IConversation,
    userId: Schema.Types.ObjectId,
    role: 'admin' | 'moderator' | 'member' = 'member'
): Promise<IConversation> {
    const existingParticipant = this.participants.find(p =>
        p.userId.toString() === userId.toString()
    );
    if (existingParticipant) {
        throw new Error('User is already a participant');
    }

    this.participants.push({
        userId,
        role,
        joinedAt: new Date(),
        isMuted: false,
        lastReadAt: new Date(),
        unreadCount: 0
    } as IParticipant);

    return this.save();
};

conversationSchema.methods.removeParticipant = function (
    this: IConversation,
    userId: Schema.Types.ObjectId
): Promise<IConversation> {
    const participant = this.participants.find(p =>
        p.userId.toString() === userId.toString()
    );
    if (participant) {
        participant.leftAt = new Date();
    }
    return this.save();
};

conversationSchema.methods.updateLastMessage = function (
    this: IConversation,
    message: any
): Promise<IConversation> {
    this.lastMessageAt = message.createdAt;
    this.lastMessage = {
        messageId: message._id,
        content: message.content,
        senderId: message.senderId,
        type: message.type,
        createdAt: message.createdAt
    };
    return this.save();
};