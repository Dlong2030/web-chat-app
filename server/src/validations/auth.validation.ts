import { body } from 'express-validator';

export const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    body('displayName')
        .isLength({ min: 1, max: 100 })
        .withMessage('Display name is required and must be less than 100 characters'),
    body('username')
        .optional()
        .isLength({ max: 50 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),
    body('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Valid phone number is required'),
    body('deviceType')
        .optional()
        .isIn(['ios', 'android', 'web'])
        .withMessage('Device type must be ios, android or web')
];

export const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    body('deviceType')
        .optional()
        .isIn(['ios', 'android', 'web'])
        .withMessage('Device type must be ios, android or web')
];

export const refreshTokenValidation = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
];