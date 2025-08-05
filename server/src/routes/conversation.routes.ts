import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getConversations } from '../controllers/conversation.controller';

const router = express.Router();

// Route to get user conversations
router.get('/', authenticateToken, getConversations);

export { router as conversationRoutes };