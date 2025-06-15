import { Socket } from 'socket.io';
import { Conversation, IConversation } from '../../models';
import { Types } from 'mongoose';
import { deleteFolder } from '../../config/cloudinary';

export const registerConversationHandlers = (socket: Socket) => {
    // Tạo cuộc trò chuyện mới
    socket.on('create_conversation', async (data: {
        type: 'direct' | 'group';
        participantIds: string[];
        name?: string;
    }) => {
        try {
            const user = socket.data.user;
            const { type, participantIds, name } = data;

            const participants = [
                ...participantIds.map(id => ({
                    userId: new Types.ObjectId(id),
                    role: 'member'
                })),
                {
                    userId: user._id,
                    role: type === 'group' ? 'admin' : 'member'
                }
            ];

            const conversation = new Conversation({
                type,
                participants,
                createdBy: user._id,
                name: type === 'group' ? name : undefined
            });

            await conversation.save();

            // Tham gia vào room conversation
            participantIds.forEach(id => socket.join(id));
            socket.join(user._id.toString());

            socket.emit('conversation_created', conversation);
        } catch (error) {
            socket.emit('error', 'Failed to create conversation');
        }
    });

    // Thêm thành viên vào nhóm
    socket.on('add_participant', async (data: {
        conversationId: string;
        userId: string;
    }) => {
        try {
            const { conversationId, userId } = data;
            const conversation = await Conversation.findById(conversationId);

            if (conversation) {
                await conversation.addParticipant(new Types.ObjectId(userId));
                socket.to(userId).emit('added_to_conversation', conversation);
                socket.emit('participant_added', userId);
            }
        } catch (error) {
            socket.emit('error', 'Failed to add participant');
        }
    });

    socket.on('delete_conversation', async (conversationId: string) => {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (conversation) {
                // Xóa toàn bộ file trong các folder của hội thoại
                const folders = [
                    `messages/${conversationId}/images`,
                    `messages/${conversationId}/voices`,
                    `messages/${conversationId}/videos`,
                    `messages/${conversationId}/files`
                ];

                await Promise.all(folders.map(deleteFolder));

                // Đánh dấu xóa hội thoại trong database
                conversation.isActive = false;
                await conversation.save();

                socket.emit('conversation_deleted', conversationId);
            }
        } catch (error) {
            socket.emit('error', 'Failed to delete conversation');
        }
    });
};