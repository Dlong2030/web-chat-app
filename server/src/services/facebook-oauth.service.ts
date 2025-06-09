import axios from 'axios';
import { oauthConfig } from '../config/oauth.config';
import { FacebookUserData, OAuthTokens } from '../types/oauth.types';

export class FacebookOAuthService {
    private static readonly TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
    private static readonly USER_INFO_URL = 'https://graph.facebook.com/v18.0/me';

    /**
     * Tạo URL để redirect user đến Facebook OAuth
     */
    static getAuthUrl(state?: string): string {
        const baseUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
        const params = new URLSearchParams({
            client_id: oauthConfig.facebook.appId,
            redirect_uri: oauthConfig.facebook.redirectUri,
            scope: oauthConfig.facebook.scopes.join(','),
            response_type: 'code',
            ...(state && { state })
        });

        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * Đổi authorization code lấy access token
     */
    static async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
        try {
            const response = await axios.get<{
                access_token: string;
                expires_in: number;
            }>(this.TOKEN_URL, {
                params: {
                    client_id: oauthConfig.facebook.appId,
                    client_secret: oauthConfig.facebook.appSecret,
                    code,
                    redirect_uri: oauthConfig.facebook.redirectUri
                }
            });

            const { access_token, expires_in } = response.data;

            return {
                accessToken: access_token,
                expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined
            };
        } catch (error: any) {
            throw new Error(`Failed to exchange Facebook code: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Lấy thông tin user từ Facebook Graph API
     */
    static async getUserInfo(accessToken: string): Promise<FacebookUserData> {
        try {
            const response = await axios.get<FacebookUserData>(this.USER_INFO_URL, {
                params: {
                    fields: 'id,email,name,picture.type(large),first_name,last_name',
                    access_token: accessToken
                }
            });

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to get Facebook user info: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Kiểm tra và gia hạn long-lived access token
     * Facebook access token có thể được gia hạn thành long-lived token (60 ngày)
     */
    static async exchangeForLongLivedToken(shortLivedToken: string): Promise<OAuthTokens> {
        try {
            const response = await axios.get<{
                access_token: string;
                expires_in: number;
            }>('https://graph.facebook.com/v18.0/oauth/access_token', {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: oauthConfig.facebook.appId,
                    client_secret: oauthConfig.facebook.appSecret,
                    fb_exchange_token: shortLivedToken
                }
            });

            const { access_token, expires_in } = response.data;

            return {
                accessToken: access_token,
                expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined
            };
        } catch (error: any) {
            throw new Error(`Failed to exchange for long-lived Facebook token: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}