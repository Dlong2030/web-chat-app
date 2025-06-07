export interface RegisterRequest {
    email: string;
    password: string;
    displayName: string;
    username?: string;
    phoneNumber?: string;
    bio?: string;
    deviceToken?: string;
    deviceType?: 'ios' | 'android' | 'web';
    deviceName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    deviceToken?: string;
    deviceType?: 'ios' | 'android' | 'web';
    deviceName?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: any;
        token: string;
        refreshToken: string;
    };
    error?: string;
}

export interface TokenPayload {
    userId: string;
    type: 'access' | 'refresh';
    iat?: number; 
    exp?: number; 
}