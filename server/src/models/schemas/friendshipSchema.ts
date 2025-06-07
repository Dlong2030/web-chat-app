import { Schema, Document } from 'mongoose';

// =============================================
// INTERFACE
// =============================================

export interface IFriendship extends Document {
    requesterId: Schema.Types.ObjectId;
    addresseeId: Schema.Types.ObjectId;
    status: 'pending' | 'accepted' | 'blocked';
    createdAt: Date;
    updatedAt: Date;
}

// =============================================
// FRIENDSHIP SCHEMA
// =============================================

export const friendshipSchema = new Schema<IFriendship>({
    requesterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addresseeId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// =============================================
// INDEXES
// =============================================

friendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true });
friendshipSchema.index({ requesterId: 1, status: 1 });
friendshipSchema.index({ addresseeId: 1, status: 1 });

// =============================================
// MIDDLEWARE
// =============================================

// Prevent self-friendship
friendshipSchema.pre('save', function (next) {
    if (this.requesterId.toString() === this.addresseeId.toString()) {
        next(new Error('Cannot create friendship with yourself'));
    } else {
        next();
    }
});