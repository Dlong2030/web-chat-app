import { Schema, Document, Types } from 'mongoose';

// Interfaces
export interface IEvidence {
    type?: string;
    url?: string;
    description?: string;
}

export interface IReport extends Document {
    reporterId: Types.ObjectId;
    reportedUserId?: Types.ObjectId;
    reportedMessageId?: Types.ObjectId;
    reportedConversationId?: Types.ObjectId;
    reason: string;
    description?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    evidence: IEvidence[];
    resolvedAt?: Date;
    resolvedBy?: Types.ObjectId;
    createdAt: Date;

    // Methods
    resolve(resolvedBy: Types.ObjectId): Promise<IReport>;
    dismiss(resolvedBy: Types.ObjectId): Promise<IReport>;
}

// SUBDOCUMENT SCHEMAS
const evidenceSchema = new Schema<IEvidence>({
    type: String,
    url: String,
    description: String
}, { _id: false });

// MAIN REPORT SCHEMA
export const reportSchema = new Schema<IReport>({
    reporterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reportedMessageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    reportedConversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    reason: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending'
    },
    evidence: [evidenceSchema],
    resolvedAt: Date,
    resolvedBy: {
        type: Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// INDEXES
reportSchema.index({ reporterId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

// METHODS
reportSchema.methods.resolve = function (this: IReport, resolvedBy: Types.ObjectId): Promise<IReport> {
    this.status = 'resolved';
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    return this.save();
};

reportSchema.methods.dismiss = function (this: IReport, resolvedBy: Types.ObjectId): Promise<IReport> {
    this.status = 'dismissed';
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    return this.save();
};