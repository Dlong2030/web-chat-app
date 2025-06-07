import { Schema, Document } from 'mongoose';

// =============================================
// SUBDOCUMENT INTERFACES
// =============================================

export interface IEvidence {
    type?: string;
    url?: string;
    description?: string;
}

export interface IReport extends Document {
    reporterId: Schema.Types.ObjectId;
    reportedUserId?: Schema.Types.ObjectId;
    reportedMessageId?: Schema.Types.ObjectId;
    reportedConversationId?: Schema.Types.ObjectId;
    reason: string;
    description?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    evidence: IEvidence[];
    resolvedAt?: Date;
    resolvedBy?: Schema.Types.ObjectId;
    createdAt: Date;

    // Methods
    resolve(resolvedBy: Schema.Types.ObjectId): Promise<IReport>;
    dismiss(resolvedBy: Schema.Types.ObjectId): Promise<IReport>;
}

// =============================================
// SUBDOCUMENT SCHEMAS
// =============================================

const evidenceSchema = new Schema<IEvidence>({
    type: String,
    url: String,
    description: String
}, { _id: false });

// =============================================
// MAIN REPORT SCHEMA
// =============================================

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
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// =============================================
// INDEXES
// =============================================

reportSchema.index({ reporterId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

// =============================================
// METHODS
// =============================================

reportSchema.methods.resolve = function (this: IReport, resolvedBy: Schema.Types.ObjectId): Promise<IReport> {
    this.status = 'resolved';
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    return this.save();
};

reportSchema.methods.dismiss = function (this: IReport, resolvedBy: Schema.Types.ObjectId): Promise<IReport> {
    this.status = 'dismissed';
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    return this.save();
};