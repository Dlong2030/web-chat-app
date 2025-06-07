import { Schema, Document } from 'mongoose';

// =============================================
// INTERFACE
// =============================================

export interface ISearchHistory extends Document {
    userId: Schema.Types.ObjectId;
    query: string;
    searchType: 'message' | 'user' | 'conversation';
    results: Schema.Types.ObjectId[];
    createdAt: Date;
}

// =============================================
// SEARCH HISTORY SCHEMA
// =============================================

export const searchHistorySchema = new Schema<ISearchHistory>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true
    },
    searchType: {
        type: String,
        enum: ['message', 'user', 'conversation'],
        default: 'message'
    },
    results: [{
        type: Schema.Types.ObjectId,
        refPath: function (this: ISearchHistory) {
            if (this.searchType === 'user') return 'User';
            if (this.searchType === 'conversation') return 'Conversation';
            return 'Message';
        }
    }]
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// =============================================
// INDEXES
// =============================================

searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1 });