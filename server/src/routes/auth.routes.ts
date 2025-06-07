import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerValidation, loginValidation, refreshTokenValidation } from '../validations/auth.validation';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Register route
router.post('/register', registerValidation, AuthController.register);

// Login route  
router.post('/login', loginValidation, AuthController.login);

// Refresh token route
router.post('/refresh', refreshTokenValidation, AuthController.refreshToken);

// Logout route
router.post('/logout', authenticateToken, AuthController.logout);

export { router as authRoutes };