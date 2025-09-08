import { Request, Response } from 'express';
import { User } from '../models';
import { getQueryString, getQueryInt } from '../utils/queryHelpers';

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const currentUserId = (req as any).userId;

        // Validate userId
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
            return;
        }

        // Find user by ID, exclude sensitive information
        const user = await User.findById(userId).select(
            '_id email displayName avatarUrl phoneNumber bio isActive isVerified lastSeen status theme language notificationSettings createdAt updatedAt'
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getBatchUsersByIds = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userIds } = req.body;
        const currentUserId = (req as any).userId;

        // Validate input
        if (!userIds || !Array.isArray(userIds)) {
            res.status(400).json({
                success: false,
                message: 'userIds must be an array'
            });
            return;
        }

        if (userIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'userIds array cannot be empty'
            });
            return;
        }

        // Limit batch size for performance
        if (userIds.length > 100) {
            res.status(400).json({
                success: false,
                message: 'Cannot fetch more than 100 users at once'
            });
            return;
        }

        // Remove duplicates and invalid IDs
        const validUserIds = [...new Set(userIds.filter(id => id && typeof id === 'string'))];

        if (validUserIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'No valid user IDs provided'
            });
            return;
        }

        // Find users by IDs, exclude sensitive information
        const users = await User.find({
            _id: { $in: validUserIds },
            isActive: true // Only return active users
        }).select(
            '_id email displayName avatarUrl phoneNumber bio isActive isVerified lastSeen status theme language notificationSettings createdAt updatedAt'
        );

        res.status(200).json({
            success: true,
            data: users,
            meta: {
                requested: validUserIds.length,
                found: users.length
            }
        });

    } catch (error) {
        console.error('Error fetching users batch:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = getQueryString(req.query.q);
        const limit = Math.min(getQueryInt(req.query.limit, 10), 50); // max 50
        const page = getQueryInt(req.query.page, 1);
        const skip = (page - 1) * limit;

        if (!q || q.trim().length < 2) {
            res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long',
            });
            return;
        }

        const searchQuery = q.trim();
        const searchRegex = new RegExp(searchQuery, 'i');

        const users = await User.find({
            isActive: true,
            $or: [
                { displayName: searchRegex },
                { email: searchRegex },
            ],
        })
            .select('_id displayName avatarUrl email status lastSeen')
            .limit(limit)
            .skip(skip)
            .sort({ displayName: 1 });

        const totalCount = await User.countDocuments({
            isActive: true,
            $or: [
                { displayName: searchRegex },
                { email: searchRegex },
            ],
        });

        res.status(200).json({
            success: true,
            data: users,
            meta: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
