import express from 'express';
import { getUserById, getBatchUsersByIds } from "../controllers/user.controller";
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/:userId', authenticateToken, getUserById);
router.get('/batch', authenticateToken, getBatchUsersByIds);

export { router as userRoutes };
