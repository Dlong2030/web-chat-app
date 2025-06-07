import { Schema, Document } from 'mongoose';

// =============================================
// SUBDOCUMENT INTERFACES
// =============================================

export interface ISticker {
    name: string;
    imageUrl: string;
    tags: string[];
}

export interface IStickerPack extends Document {
    name: string;
    description?: string;
    thumbnailUrl?: string;
    isFree: boolean;
    stickers: ISticker[];
    createdAt: Date;
}

// =============================================
// SUBDOCUMENT SCHEMAS
// =============================================

const stickerSchema = new Schema<ISticker>({
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    imageUrl: {
        type: String,
        required: true
    },
    tags: [String]
}, { _id: false });

// =============================================
// MAIN STICKER PACK SCHEMA
// =============================================

export const stickerPackSchema = new Schema<IStickerPack>({
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: String,
    thumbnailUrl: String,
    isFree: {
        type: Boolean,
        default: true
    },
    stickers: {
        type: [stickerSchema],
        required: true,
        validate: {
            validator: function (stickers: ISticker[]) {
                return stickers.length > 0;
            },
            message: 'Sticker pack must have at least one sticker'
        }
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// =============================================
// INDEXES
// =============================================

stickerPackSchema.index({ name: 1 });
stickerPackSchema.index({ 'stickers.tags': 1 });