export interface GoogleUserData {
    id: string;
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
}

export interface FacebookUserData {
    id: string;
    email: string;
    name: string;
    picture?: {
        data: {
            url: string;
        };
    };
    first_name?: string;
    last_name?: string;
}

export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
}

export interface AuthResult {
    user: any; 
    accessToken: string;
    refreshToken?: string;
    isNewUser: boolean;
}