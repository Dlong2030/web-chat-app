export const oauthConfig = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/google/callback',
        scopes: ['openid', 'profile', 'email']
    },
    facebook: {
        appId: process.env.FACEBOOK_APP_ID!,
        appSecret: process.env.FACEBOOK_APP_SECRET!,
        redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/facebook/callback',
        scopes: ['email', 'public_profile']
    }
};

// Kiểm tra các biến môi trường cần thiết
export const validateOAuthConfig = (): void => {
    const required = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'FACEBOOK_APP_ID',
        'FACEBOOK_APP_SECRET'
    ];

    for (const env of required) {
        if (!process.env[env]) {
            throw new Error(`Missing required environment variable: ${env}`);
        }
    }
};