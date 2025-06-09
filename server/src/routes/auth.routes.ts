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

// Get user profile route
router.get('/me', authenticateToken, AuthController.getCurrentUser);

// OAuth routes
router.get('/google', AuthController.initiateGoogleAuth);
router.get('/google/callback', AuthController.handleGoogleCallback);
router.get('/facebook', AuthController.initiateFacebookAuth);
router.get('/facebook/callback', AuthController.handleFacebookCallback);

export { router as authRoutes };