import { Socket } from 'socket.io';
import { IMessage, Message } from '../../models';
import { IUser } from '../../models';
import { uploadToCloudinary } from '../../config/cloudinary';
import { Types } from 'mongoose';
import { deleteAttachment } from '../../config/cloudinary';

export const registerMessageHandlers = (socket: Socket) => {
    socket.on('send_message', async (data: {
        conversationId: string;
        content?: string;
        type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'sticker';
        file?: any;
        replyTo?: string;
    }) => {
        try {
            const user = socket.data.user as IUser;
            const { conversationId, content, type, file, replyTo } = data;

            let attachments = [];
            if (file) {
                // Xác định loại file để upload vào thư mục phù hợp
                let fileType: 'image' | 'voice' | 'video' | 'file' = 'file';

                if (type === 'image') fileType = 'image';
                else if (type === 'voice') fileType = 'voice';
                else if (type === 'video') fileType = 'video';

                const result = await uploadToCloudinary(file, conversationId, fileType);

                // Tạo attachment với metadata phù hợp
                const attachment: any = {
                    fileName: file.originalname,
                    fileUrl: result.secure_url,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    publicId: result.public_id,
                    resourceType: result.resource_type // Lưu loại resource để xử lý sau này
                };
                attachments.push(attachment);
            }

            const messageData: any = {
                conversationId: new Types.ObjectId(conversationId),
                senderId: user._id,
                type,
                attachments
            };

            if (content) messageData.content = content;
            if (replyTo) messageData.replyTo = { messageId: new Types.ObjectId(replyTo) };

            const message = new Message(messageData);
            await message.save();

            // Broadcast tin nhắn đến các thành viên trong cuộc trò chuyện
            socket.to(conversationId).emit('new_message', message);
        } catch (error) {
            socket.emit('error', 'Failed to send message');
        }
    });

    // Đánh dấu tin nhắn đã đọc
    socket.on('mark_as_read', async (messageId: string) => {
        try {
            const user = socket.data.user as IUser;
            const message = await Message.findById(messageId);

            if (message) {
                await message.markAsRead(user._id);
                socket.emit('message_read', messageId);
            }
        } catch (error) {
            socket.emit('error', 'Failed to mark message as read');
        }
    });

    socket.on('react_to_message', async (data: { messageId: string; reaction: string }) => {
        try {
            const user = socket.data.user as IUser;
            const { messageId, reaction } = data;
            const message = await Message.findById(messageId);

            if (message) {
                await message.addReaction(user._id, reaction);
                socket.emit('reaction_added', { messageId, reaction });
            }
        } catch (error) {
            socket.emit('error', 'Failed to add reaction');
        }
    });

    // Xóa tin nhắn và các file đính kèm
    socket.on('delete_message', async (messageId: string) => {
        try {
            const user = socket.data.user as IUser;
            const message = await Message.findById(messageId);

            if (message) {
                // Xóa tất cả attachments khỏi Cloudinary
                for (const attachment of message.attachments) {
                    await deleteAttachment(attachment);
                }

                // Đánh dấu xóa trong database
                message.isDeleted = true;
                message.deletedAt = new Date();
                message.deletedBy = user._id;
                await message.save();

                // Broadcast sự kiện xóa tin nhắn
                socket.to(message.conversationId.toString()).emit('message_deleted', messageId);
                socket.emit('message_deleted', messageId);
            }
        } catch (error) {
            socket.emit('error', 'Failed to delete message');
            console.error('Message deletion error:', error);
        }
    });

    // Xóa attachment riêng lẻ (nếu cần)
    socket.on('delete_attachment', async (data: { messageId: string; attachmentIndex: number }) => {
        try {
            const { messageId, attachmentIndex } = data;
            const message = await Message.findById(messageId);

            if (message && message.attachments[attachmentIndex]) {
                const attachment = message.attachments[attachmentIndex];

                // Xóa file khỏi Cloudinary
                await deleteAttachment(attachment);

                // Xóa attachment khỏi mảng
                message.attachments.splice(attachmentIndex, 1);
                await message.save();

                socket.emit('attachment_deleted', { messageId, attachmentIndex });
            }
        } catch (error) {
            socket.emit('error', 'Failed to delete attachment');
        }
    });
};