import { IConversation, ConversationResponse } from '../types/chat.types';
import { IChatItem } from '../types/sidebar.types';
import { User } from '../types/auth.types';

// Transform API conversation data to IChatItem format
export const transformConversationToIChatItem = (
    conversation: IConversation,
    currentUser: User,
    participantsData?: { [userId: string]: User }
): IChatItem => {
    let otherParticipant: User | undefined;

    if (conversation.type === 'direct' && currentUser) {
        // Tìm participant không phải current user
        const otherParticipantData = conversation.participants?.find(
            p => p.userId !== currentUser._id
        );

        if (otherParticipantData) {
            // Dữ liệu từ participantsData
            if (participantsData?.[otherParticipantData.userId]) {
                otherParticipant = participantsData[otherParticipantData.userId];
            }
            // Dữ liệu embedded trong participant
            else if (otherParticipantData.user) {
                otherParticipant = otherParticipantData.user as User;
            }
            // Fallback: Tạo minimal user object từ thông tin cơ bản
            else {
                otherParticipant = {
                    _id: otherParticipantData.userId,
                    displayName: otherParticipantData.displayName || `User-${otherParticipantData.userId.slice(0, 6)}`,
                    avatarUrl: otherParticipantData.avatarUrl,
                    email: otherParticipantData.displayName || `user-${otherParticipantData.userId.slice(0, 6)}@example.com`,
                    status: 'offline',
                    isActive: false,
                    isVerified: false,
                    lastSeen: new Date(),
                    theme: 'light',
                    language: 'vi',
                    authProviders: [],
                    devices: [],
                    notificationSettings: {
                        messages: true,
                        mentions: true,
                        reactions: true,
                        calls: true,
                        emailNotifications: true,
                        pushNotifications: true,
                        soundEnabled: true,
                        vibrationEnabled: true
                    },
                    stickerPacks: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as User;
            }
        }
    }

    const unreadCount = calculateUnreadCount(conversation, currentUser._id);
    const isOnline = otherParticipant?.status === 'online' && otherParticipant?.isActive;

    return {
        conversation,
        otherParticipant,
        unreadCount,
        lastActivity: conversation.updatedAt ? new Date(conversation.updatedAt) : new Date(),
        isOnline: Boolean(isOnline),
        isTyping: false
    };
};

/**
 * Calculate unread message count for a conversation
 */
export const calculateUnreadCount = (conversation: IConversation, currentUserId: string): number => {
    if (!conversation.lastMessage) return 0;

    // If the current user sent the last message, no unread count
    if (conversation.lastMessage.senderId === currentUserId) return 0;

    // Check if current user has read the last message
    const isRead = conversation.lastMessage.readBy?.some(read => read.userId === currentUserId);

    if (isRead) return 0;

    // For now, return 1 if there's an unread message
    // In a real app, you might want to count actual unread messages
    return 1;
};

/**
 * Sort conversations by last activity
 */
export const sortConversationsByActivity = (chatItems: IChatItem[]): IChatItem[] => {
    return [...chatItems].sort((a, b) => {
        const timeA = new Date(a.lastActivity).getTime();
        const timeB = new Date(b.lastActivity).getTime();
        return timeB - timeA; // Most recent first
    });
};

/**
 * Filter conversations by search query
 */
export const filterConversationsByQuery = (
    chatItems: IChatItem[],
    searchQuery: string
): IChatItem[] => {
    if (!searchQuery.trim()) return chatItems;

    const query = searchQuery.toLowerCase();

    return chatItems.filter(item => {
        // Search in conversation name (for groups)
        if (item.conversation.name?.toLowerCase().includes(query)) {
            return true;
        }

        // Search in participant name (for direct chats)
        if (item.otherParticipant?.displayName?.toLowerCase().includes(query)) {
            return true;
        }

        // Search in participant email
        if (item.otherParticipant?.email?.toLowerCase().includes(query)) {
            return true;
        }

        // Search in last message content
        if (item.conversation.lastMessage?.content?.toLowerCase().includes(query)) {
            return true;
        }

        return false;
    });
};

/**
 * Get display name for a conversation
 */
export const getConversationDisplayName = (
    conversation: IConversation,
    otherParticipant?: User
): string => {
    if (conversation.type === 'group') {
        return conversation.name || 'Nhóm chat';
    }

    return otherParticipant?.displayName || 'Người dùng';
};

/**
 * Get avatar URL for a conversation
 */
export const getConversationAvatar = (
    conversation: IConversation,
    otherParticipant?: User
): string | undefined => {
    if (conversation.type === 'group') {
        return conversation.avatar; // If groups have avatars
    }

    return otherParticipant?.avatarUrl;
};

/**
 * Check if a user is currently online
 */
export const isUserOnline = (user?: User): boolean => {
    if (!user) return false;

    return user.status === 'online' && user.isActive;
};

/**
 * Format last activity time
 */
export const formatLastActivity = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    try {
        return dateObj.toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

/**
 * Get message preview text
 */
export const getMessagePreview = (
    conversation: IConversation,
    currentUserId: string,
    isTyping: boolean = false
): string => {
    if (isTyping) return 'Đang nhập...';
    if (!conversation.lastMessage) return 'Bắt đầu cuộc trò chuyện';

    const { content, type, senderId } = conversation.lastMessage;
    const isCurrentUser = senderId === currentUserId;
    const prefix = isCurrentUser ? 'Bạn: ' : '';

    switch (type) {
        case 'image':
            return `${prefix}📷 Đã gửi ảnh`;
        case 'voice':
            return `${prefix}🎵 Tin nhắn thoại`;
        case 'video':
            return `${prefix}🎬 Đã gửi video`;
        case 'file':
            return `${prefix}📎 Đã gửi file`;
        case 'sticker':
            return `${prefix}😊 Đã gửi sticker`;
        default:
            if (!content || content.trim() === '') {
                return `${prefix}Tin nhắn`;
            }
            const truncatedContent = content.length > 50
                ? content.slice(0, 50) + '...'
                : content;
            return `${prefix}${truncatedContent}`;
    }
};