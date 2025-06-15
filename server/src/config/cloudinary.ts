import { v2 as cloudinary } from 'cloudinary';
import { IAttachment } from '../models'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm xác định thư mục và resource type
const getUploadOptions = (type: string, conversationId: string): {
    folder: string;
    resource_type: 'image' | 'video' | 'raw' | 'auto';
} => {
    switch (type) {
        case 'image':
            return {
                folder: `messages/${conversationId}/images`,
                resource_type: 'image'
            };
        case 'voice':
            return {
                folder: `messages/${conversationId}/voices`,
                resource_type: 'video'
            };
        case 'video':
            return {
                folder: `messages/${conversationId}/videos`,
                resource_type: 'video'
            };
        default:
            return {
                folder: `messages/${conversationId}/files`,
                resource_type: 'raw' // Loại file khác (PDF, DOC, etc.)
            };
    }
};

export const uploadToCloudinary = async (
    file: any,
    conversationId: string,
    fileType: 'image' | 'voice' | 'video' | 'file'
): Promise<any> => {
    const { folder, resource_type } = getUploadOptions(fileType, conversationId);

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type,
                // Tối ưu hóa cho từng loại file
                ...(fileType === 'image' && { quality: 'auto:good' }),
                ...(fileType === 'voice' && { audio_codec: 'aac' }),
                ...(fileType === 'video' && { format: 'mp4' }),
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(file.buffer);
    });
};

export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: 'image' | 'video' | 'raw'
): Promise<any> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true // Xóa khỏi cache CDN
        });

        if (result.result !== 'ok') {
            throw new Error(`Failed to delete ${publicId}: ${result.result}`);
        }

        return result;
    } catch (error) {
        console.error(`Error deleting ${publicId}:`, error);
        throw error;
    }
};

export const deleteAttachment = async (attachment: {
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw';
}) => {
    if (!attachment.publicId || !attachment.resourceType) {
        console.warn('Attachment missing metadata for deletion', attachment);
        return;
    }

    try {
        await deleteFromCloudinary(attachment.publicId, attachment.resourceType);
        console.log(`Deleted attachment: ${attachment.publicId}`);
    } catch (error) {
        console.error(`Failed to delete attachment ${attachment.publicId}:`, error);
    }
};

export const deleteMultipleAttachments = async (attachments: {
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw';
}[]) => {
    await Promise.all(attachments.map(deleteAttachment));
};

export const deleteFolder = async (folderPath: string) => {
    try {
        const result = await cloudinary.api.delete_folder(folderPath);
        return result;
    } catch (error) {
        console.error(`Error deleting folder ${folderPath}:`, error);
        throw error;
    }
};