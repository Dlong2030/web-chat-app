// src/models/index.ts
import mongoose from 'mongoose';

// Import schemas
import { userSchema, IUser } from './schemas/userSchema';
import { friendshipSchema, IFriendship } from './schemas/friendshipSchema';
import { conversationSchema, IConversation } from './schemas/conversationSchema';
import { messageSchema, IMessage } from './schemas/messageSchema';
import { notificationSchema, INotification } from './schemas/notificationSchema';
import { stickerPackSchema, IStickerPack } from './schemas/stickerPackSchema';
import { searchHistorySchema, ISearchHistory } from './schemas/searchHistorySchema';
import { reportSchema, IReport } from './schemas/reportSchema';

// =============================================
// CREATE MODELS
// =============================================

export const User = mongoose.model<IUser>('User', userSchema);
export const Friendship = mongoose.model<IFriendship>('Friendship', friendshipSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);
export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export const StickerPack = mongoose.model<IStickerPack>('StickerPack', stickerPackSchema);
export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);
export const Report = mongoose.model<IReport>('Report', reportSchema);

// =============================================
// EXPORT INTERFACES
// =============================================

export type {
    IUser,
    IFriendship,
    IConversation,
    IMessage,
    INotification,
    IStickerPack,
    ISearchHistory,
    IReport
};

// Export subdocument interfaces
export type {
    IAuthProvider,
    IDevice,
    INotificationSettings,
    IUserStickerPack
} from './schemas/userSchema';

export type {
    IParticipant,
    ILastMessage,
    IConversationSettings
} from './schemas/conversationSchema';

export type {
    IAttachment,
    IReaction,
    IReadBy,
    IReplyTo,
    IForwardedFrom,
    IEditHistory
} from './schemas/messageSchema';

export type {
    ISticker
} from './schemas/stickerPackSchema';

export type {
    IEvidence
} from './schemas/reportSchema';

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Seed default data
export const seedDefaultData = async (): Promise<void> => {
    try {
        // Create default sticker pack if not exists
        const defaultPack = await StickerPack.findOne({ name: 'Default Emotions' });
        if (!defaultPack) {
            await StickerPack.create({
                name: 'Default Emotions',
                description: 'Basic emotion stickers',
                thumbnailUrl: '/stickers/default/thumbnail.png',
                isFree: true,
                stickers: [
                    {
                        name: 'happy',
                        imageUrl: '/stickers/default/happy.png',
                        tags: ['happy', 'smile', 'joy']
                    },
                    {
                        name: 'sad',
                        imageUrl: '/stickers/default/sad.png',
                        tags: ['sad', 'cry', 'upset']
                    },
                    {
                        name: 'love',
                        imageUrl: '/stickers/default/love.png',
                        tags: ['love', 'heart', 'romantic']
                    }
                ]
            });
            console.log('Default sticker pack created');
        }
    } catch (error) {
        console.error('Error seeding default data:', error);
    }
};