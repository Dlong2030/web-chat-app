// mockData.ts
import { User } from '../../types/auth.types';
import { IConversation, IMessage } from '../../types/chat.types';
import { IChatItem } from '../../types/sidebar.types';

// Mock Users
export const mockUsers: User[] = [
    {
        _id: "user_1",
        email: "john.doe@email.com",
        displayName: "John Doe",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        phoneNumber: "+84901234567",
        bio: "Software Developer",
        isActive: true,
        isVerified: true,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        status: "online",
        theme: "light",
        language: "vi",
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
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date()
    },
    {
        _id: "user_2",
        email: "alice.smith@email.com",
        displayName: "Alice Smith",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616c5e1d2b3?w=150&h=150&fit=crop&crop=face",
        bio: "UX Designer",
        isActive: true,
        isVerified: true,
        lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        status: "online",
        theme: "dark",
        language: "vi",
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
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date()
    },
    {
        _id: "user_3",
        email: "bob.wilson@email.com",
        displayName: "Bob Wilson",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        bio: "Product Manager",
        isActive: false,
        isVerified: true,
        lastSeen: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        status: "away",
        theme: "auto",
        language: "vi",
        authProviders: [],
        devices: [],
        notificationSettings: {
            messages: true,
            mentions: true,
            reactions: true,
            calls: true,
            emailNotifications: false,
            pushNotifications: true,
            soundEnabled: true,
            vibrationEnabled: false
        },
        stickerPacks: [],
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date()
    },
    {
        _id: "user_4",
        email: "emma.brown@email.com",
        displayName: "Emma Brown",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bio: "Marketing Specialist",
        isActive: true,
        isVerified: true,
        lastSeen: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        status: "busy",
        theme: "light",
        language: "vi",
        authProviders: [],
        devices: [],
        notificationSettings: {
            messages: true,
            mentions: true,
            reactions: false,
            calls: true,
            emailNotifications: true,
            pushNotifications: true,
            soundEnabled: false,
            vibrationEnabled: true
        },
        stickerPacks: [],
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date()
    },
    {
        _id: "user_5",
        email: "david.lee@email.com",
        displayName: "David Lee",
        isActive: false,
        isVerified: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: "offline",
        theme: "dark",
        language: "vi",
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
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date()
    },
    {
        _id: "user_6",
        email: "sophia.garcia@email.com",
        displayName: "Sophia Garcia",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        bio: "Data Scientist",
        isActive: true,
        isVerified: true,
        lastSeen: new Date(),
        status: "online",
        theme: "light",
        language: "vi",
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
        createdAt: new Date("2024-01-08"),
        updatedAt: new Date()
    }
];

// Current User (the logged-in user)
export const currentUser: User = {
    _id: "current_user",
    email: "me@email.com",
    displayName: "Tôi",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    bio: "Full Stack Developer",
    isActive: true,
    isVerified: true,
    lastSeen: new Date(),
    status: "online",
    theme: "light",
    language: "vi",
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
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date()
};

// Mock Messages
const mockMessages: IMessage[] = [
    {
        _id: "msg_1",
        conversationId: "conv_1",
        senderId: "user_1",
        content: "Hey! Có khỏe không?",
        type: "text",
        attachments: [],
        reactions: [],
        readBy: [{ userId: "current_user", readAt: new Date() }],
        isDeleted: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
        _id: "msg_2",
        conversationId: "conv_2",
        senderId: "user_2",
        content: "Đã gửi ảnh",
        type: "image",
        attachments: [{
            fileName: "photo.jpg",
            fileUrl: "https://example.com/photo.jpg",
            fileType: "image/jpeg",
            fileSize: 1024000,
            publicId: "photo_123",
            resourceType: "image"
        }],
        reactions: [],
        readBy: [],
        isDeleted: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
        _id: "msg_3",
        conversationId: "conv_3",
        senderId: "current_user",
        content: "Meeting lúc 2pm nhé!",
        type: "text",
        attachments: [],
        reactions: [],
        readBy: [{ userId: "user_3", readAt: new Date() }],
        isDeleted: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
        _id: "msg_4",
        conversationId: "conv_4",
        senderId: "user_4",
        content: "Campaign kết quả tốt quá! 🎉",
        type: "text",
        attachments: [],
        reactions: [{ userId: "current_user", reaction: "👍", createdAt: new Date() }],
        readBy: [],
        isDeleted: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
        _id: "msg_5",
        conversationId: "conv_5",
        senderId: "user_5",
        content: "Tối nay có rảnh không?",
        type: "text",
        attachments: [],
        reactions: [],
        readBy: [],
        isDeleted: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        _id: "msg_6",
        conversationId: "conv_6",
        senderId: "current_user",
        content: "Dự án team UI/UX",
        type: "text",
        attachments: [],
        reactions: [],
        readBy: [
            { userId: "user_1", readAt: new Date() },
            { userId: "user_2", readAt: new Date() },
            { userId: "user_6", readAt: new Date() }
        ],
        isDeleted: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
];

// Mock Conversations
export const mockConversations: IConversation[] = [
    {
        _id: "conv_1",
        type: "direct",
        participants: [
            { userId: "current_user", role: "member", joinedAt: new Date("2024-01-15") },
            { userId: "user_1", role: "member", joinedAt: new Date("2024-01-15") }
        ],
        lastMessage: mockMessages[0],
        createdBy: "current_user",
        isActive: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
        _id: "conv_2",
        type: "direct",
        participants: [
            { userId: "current_user", role: "member", joinedAt: new Date("2024-02-10") },
            { userId: "user_2", role: "member", joinedAt: new Date("2024-02-10") }
        ],
        lastMessage: mockMessages[1],
        createdBy: "user_2",
        isActive: true,
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
        _id: "conv_3",
        type: "direct",
        participants: [
            { userId: "current_user", role: "member", joinedAt: new Date("2024-01-20") },
            { userId: "user_3", role: "member", joinedAt: new Date("2024-01-20") }
        ],
        lastMessage: mockMessages[2],
        createdBy: "current_user",
        isActive: true,
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
        _id: "conv_4",
        type: "direct",
        participants: [
            { userId: "current_user", role: "member", joinedAt: new Date("2024-03-01") },
            { userId: "user_4", role: "member", joinedAt: new Date("2024-03-01") }
        ],
        lastMessage: mockMessages[3],
        createdBy: "user_4",
        isActive: true,
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
        _id: "conv_5",
        type: "direct",
        participants: [
            { userId: "current_user", role: "member", joinedAt: new Date("2024-02-15") },
            { userId: "user_5", role: "member", joinedAt: new Date("2024-02-15") }
        ],
        lastMessage: mockMessages[4],
        createdBy: "user_5",
        isActive: true,
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        _id: "conv_6",
        type: "group",
        participants: [
            { userId: "current_user", role: "admin", joinedAt: new Date("2024-01-08") },
            { userId: "user_1", role: "member", joinedAt: new Date("2024-01-08") },
            { userId: "user_2", role: "member", joinedAt: new Date("2024-01-09") },
            { userId: "user_6", role: "member", joinedAt: new Date("2024-01-10") }
        ],
        name: "Team Design",
        lastMessage: mockMessages[5],
        createdBy: "current_user",
        isActive: true,
        createdAt: new Date("2024-01-08"),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
];

// Helper function to get other participant in direct conversation
const getOtherParticipant = (conversation: IConversation, currentUserId: string): User | undefined => {
    if (conversation.type !== 'direct') return undefined;

    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
    if (!otherParticipant) return undefined;

    return mockUsers.find(user => user._id === otherParticipant.userId);
};

// Helper function to calculate unread count
const getUnreadCount = (conversation: IConversation, currentUserId: string): number => {
    if (!conversation.lastMessage) return 0;

    const isRead = conversation.lastMessage.readBy.some(read => read.userId === currentUserId);
    const isSentByCurrentUser = conversation.lastMessage.senderId === currentUserId;

    // If message is sent by current user or already read, no unread count
    if (isSentByCurrentUser || isRead) return 0;

    // For demo purposes, return random unread count
    return Math.floor(Math.random() * 5) + 1;
};

// Mock Chat Items for Sidebar
export const mockChatItems: IChatItem[] = mockConversations.map(conversation => {
    const otherParticipant = getOtherParticipant(conversation, currentUser._id);
    const unreadCount = getUnreadCount(conversation, currentUser._id);

    return {
        conversation,
        otherParticipant,
        unreadCount,
        lastActivity: conversation.updatedAt,
        isOnline: otherParticipant?.status === 'online',
        isTyping: Math.random() > 0.8 // Random typing status for demo
    };
});

// Export all mock data
export const mockData = {
    currentUser,
    users: mockUsers,
    conversations: mockConversations,
    messages: mockMessages,
    chatItems: mockChatItems
};