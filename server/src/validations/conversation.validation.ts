import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation schemas
export const createConversationSchema = Joi.object({
    type: Joi.string().valid('direct', 'group').required(),
    name: Joi.when('type', {
        is: 'group',
        then: Joi.string().min(1).max(100).required(),
        otherwise: Joi.forbidden()
    }),
    description: Joi.when('type', {
        is: 'group',
        then: Joi.string().max(500).optional(),
        otherwise: Joi.forbidden()
    }),
    participantIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    avatarUrl: Joi.string().uri().optional()
});

export const updateConversationSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    avatarUrl: Joi.string().uri().optional(),
    settings: Joi.object({
        allowInvites: Joi.boolean().optional(),
        showMembersList: Joi.boolean().optional(),
        allowMemberMessages: Joi.boolean().optional()
    }).optional()
});

export const getConversationsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    type: Joi.string().valid('direct', 'group').optional(),
    search: Joi.string().min(1).max(100).optional(),
    sortBy: Joi.string().valid('lastMessageAt', 'createdAt', 'name').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
});

// Validation middleware
export const validateCreateConversation = (req: Request, res: Response, next: NextFunction) => {
    const { error } = createConversationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.details[0].message
        });
    }
    next();
};

export const validateUpdateConversation = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateConversationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.details[0].message
        });
    }
    next();
};

export const validateGetConversationsQuery = (req: Request, res: Response, next: NextFunction) => {
    const { error } = getConversationsQuerySchema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.details[0].message
        });
    }
    next();
}; 