import axios from 'axios';
import { oauthConfig } from '../config/oauth.config';
import { GoogleUserData, OAuthTokens } from '../types/oauth.types';

export class GoogleOAuthService {
    private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private static readonly USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

    /**
     * Tạo URL để redirect user đến Google OAuth
     */
    static getAuthUrl(state?: string): string {
        const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = new URLSearchParams({
            client_id: oauthConfig.google.clientId,
            redirect_uri: oauthConfig.google.redirectUri,
            response_type: 'code',
            scope: oauthConfig.google.scopes.join(' '),
            access_type: 'offline', // Để lấy refresh token
            prompt: 'consent', // Luôn hiện consent screen để lấy refresh token
            ...(state && { state })
        });

        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * Đổi authorization code lấy access token
     */
    static async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
        try {
            const response = await axios.post<{
                access_token: string;
                refresh_token: string;
                expires_in: number;
            }>(this.TOKEN_URL, {
                client_id: oauthConfig.google.clientId,
                client_secret: oauthConfig.google.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: oauthConfig.google.redirectUri
            });

            const { access_token, refresh_token, expires_in } = response.data;

            return {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined
            };
        } catch (error: any) {
            throw new Error(`Failed to exchange Google code: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Lấy thông tin user từ Google API
     */
    static async getUserInfo(accessToken: string): Promise<GoogleUserData> {
        try {
            const response = await axios.get<GoogleUserData>(this.USER_INFO_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to get Google user info: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Refresh access token bằng refresh token
     */
    static async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
        try {
            const response = await axios.post<{
                access_token: string;
                expires_in: number;
            }>(this.TOKEN_URL, {
                client_id: oauthConfig.google.clientId,
                client_secret: oauthConfig.google.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            });

            const { access_token, expires_in } = response.data;

            return {
                accessToken: access_token,
                expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined
            };
        } catch (error: any) {
            throw new Error(`Failed to refresh Google token: ${error.response?.data?.error_description || error.message}`);
        }
    }
}