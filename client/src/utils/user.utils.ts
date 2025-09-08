// utils/userUtils.ts
import { User } from '../types/auth.types';
import { IConversation } from '../types/chat.types';

// Cache for user data to avoid repeated API calls
const userCache = new Map<string, User>();

// Mock function - replace with real API call
export const fetchUserById = async (userId: string): Promise<User | undefined> => {
    // Check cache first
    if (userCache.has(userId)) {
        return userCache.get(userId);
    }

    try {
        // Replace this with your actual API call
        const response = await fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const user: User = await response.json();

        // Cache the user data
        userCache.set(userId, user);

        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return undefined;
    }
};

// Helper to get other participant in direct conversation
export const getOtherParticipant = (conversation: IConversation, currentUserId: string): string | undefined => {
    if (conversation.type !== 'direct') return undefined;

    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.userId;
};

// Helper to calculate unread count
export const calculateUnreadCount = (conversation: IConversation, currentUserId: string): number => {
    if (!conversation.lastMessage) return 0;

    const isRead = conversation.lastMessage.readBy.some(read => read.userId === currentUserId);
    const isSentByCurrentUser = conversation.lastMessage.senderId === currentUserId;

    // If message is sent by current user or already read, no unread count
    if (isSentByCurrentUser || isRead) return 0;

    // This is simplified - you might need to count all unread messages
    // not just check the last message
    return 1;
};

// Clear user cache (useful for logout)
export const clearUserCache = () => {
    userCache.clear();
};