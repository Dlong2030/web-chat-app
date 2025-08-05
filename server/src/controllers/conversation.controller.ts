import { Request, Response } from 'express';
import { Types, PipelineStage } from 'mongoose';
import { Conversation, User, Message } from '../models'; import {
    ChatItemResponse,
    ConversationsResponse,
    OtherParticipantResponse,
    LastMessageResponse
} from '../types/chat.types';

interface ReadByEntry {
    userId: Types.ObjectId;
    readAt: Date;
}

export const getConversations = async (req: Request, res: Response<ConversationsResponse>) => {
    try {
        const currentUserId = new Types.ObjectId((req as any).userId);

        console.log("Current user ID:", currentUserId);
        
        // 1. Lấy tất cả cuộc trò chuyện mà người dùng hiện tại tham gia
        const conversations = await Conversation.find({
            'participants.userId': currentUserId,
            'participants.leftAt': { $exists: false }
        })
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .lean();

        // 2. Tạo mảng kết quả
        const chatItems: ChatItemResponse[] = [];

        // 3. Thu thập tất cả ID cần thiết để tối ưu query
        const allUserIds: Types.ObjectId[] = [];
        const allMessageIds: Types.ObjectId[] = [];

        conversations.forEach(conv => {
            conv.participants.forEach(p => {
                if (!p.userId.equals(currentUserId)) {
                    allUserIds.push(p.userId);
                }
            });

            if (conv.lastMessage?.messageId) {
                allMessageIds.push(conv.lastMessage.messageId);
            }
        });

        // 4. Lấy thông tin users và messages trong một lần query
        const [users, messages] = await Promise.all([
            User.find({ _id: { $in: allUserIds } }).lean(),
            Message.find({ _id: { $in: allMessageIds } }).lean()
        ]);

        // 5. Tạo bản đồ cho truy cập nhanh
        const userMap = new Map<string, any>();
        users.forEach(user => {
            userMap.set(user._id.toString(), user);
        });

        const messageMap = new Map<string, any>();
        messages.forEach(message => {
            messageMap.set(message._id.toString(), message);
        });

        // 6. Xử lý từng conversation
        for (const conv of conversations) {
            // 6a. Tìm participant của người dùng hiện tại
            const currentParticipant = conv.participants.find(
                p => p.userId.equals(currentUserId)
            );

            const unreadCount = currentParticipant?.unreadCount || 0;

            // 6b. Xác định otherParticipant và isOnline (chỉ cho chat 1-1)
            let otherParticipant: OtherParticipantResponse | undefined;
            let isOnline = false;

            if (conv.type === 'direct') {
                // Tìm người tham gia khác (không phải current user)
                const otherParticipantData = conv.participants.find(
                    p => !p.userId.equals(currentUserId)
                );

                if (otherParticipantData) {
                    const userIdStr = otherParticipantData.userId.toString();
                    const user = userMap.get(userIdStr);

                    if (user) {
                        // Xử lý lastSeen an toàn
                        const lastSeenValue = user.lastSeen ? new Date(user.lastSeen).getTime() : 0;
                        const now = Date.now();
                        const fiveMinutes = 5 * 60 * 1000;

                        isOnline = user.status === 'online' && (now - lastSeenValue < fiveMinutes);

                        otherParticipant = {
                            _id: userIdStr,
                            displayName: user.displayName,
                            avatarUrl: user.avatarUrl || '',
                            status: user.status,
                            lastSeen: user.lastSeen || new Date(0),
                            username: user.username || ''
                        };
                    }
                }
            }

            // 6c. Lấy thông tin lastMessage nếu có
            let lastMessage: LastMessageResponse | undefined;
            if (conv.lastMessage?.messageId) {
                const messageIdStr = conv.lastMessage.messageId.toString();
                const message = messageMap.get(messageIdStr);

                if (message) {
                    // Sửa lỗi tại đây: thêm kiểu ReadByEntry cho tham số r
                    lastMessage = {
                        _id: messageIdStr,
                        conversationId: message.conversationId.toString(),
                        senderId: message.senderId.toString(),
                        content: message.content || '',
                        type: message.type,
                        readBy: message.readBy.map((r: ReadByEntry) => ({
                            userId: r.userId.toString(),
                            readAt: r.readAt
                        })),
                        createdAt: message.createdAt
                    };
                }
            }

            // 6d. Xác định lastActivity (ưu tiên lastMessageAt)
            const lastActivity = conv.lastMessageAt || conv.updatedAt;

            // 6e. Tạo chat item
            const chatItem: ChatItemResponse = {
                conversation: {
                    _id: conv._id.toString(),
                    type: conv.type,
                    participants: conv.participants.map(p => ({
                        userId: p.userId.toString(),
                        role: p.role,
                        joinedAt: p.joinedAt,
                        leftAt: p.leftAt,
                        isMuted: p.isMuted,
                        muteUntil: p.muteUntil,
                        nickname: p.nickname,
                        lastReadAt: p.lastReadAt,
                        unreadCount: p.unreadCount
                    })),
                    name: conv.name,
                    lastMessage: lastMessage,
                    createdBy: conv.createdBy?.toString() || '',
                    isActive: conv.isActive,
                    createdAt: conv.createdAt,
                    updatedAt: conv.updatedAt
                },
                otherParticipant: otherParticipant,
                unreadCount: unreadCount,
                lastActivity: lastActivity,
                isOnline: isOnline,
                isTyping: false
            };

            chatItems.push(chatItem);
        }

        // 7. Trả về kết quả
        res.json({
            success: true,
            data: chatItems
        });

    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        res.status(500).json({
            success: false,
            data: []
        });
    }
};