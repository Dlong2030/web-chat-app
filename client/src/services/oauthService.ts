export interface OAuthPopupOptions {
    width?: number;
    height?: number;
    centerOnScreen?: boolean;
}

export interface OAuthResponse {
    success: boolean;
    data?: {
        user: any;
        accessToken: string;
        refreshToken: string;
        isNewUser?: boolean;
    };
    error?: string;
}

class OAuthService {
    private static baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

    /**
     * Mở popup OAuth và lắng nghe kết quả
     */
    // private static openOAuthPopup(
    //     url: string,
    //     name: string,
    //     options: OAuthPopupOptions = {}
    // ): Promise<OAuthResponse> {
    //     return new Promise((resolve, reject) => {
    //         const {
    //             width = 500,
    //             height = 600,
    //             centerOnScreen = true
    //         } = options;

    //         // Tính toán vị trí popup ở giữa màn hình
    //         let left = 0;
    //         let top = 0;

    //         if (centerOnScreen && window.screen) {
    //             left = (window.screen.width - width) / 2;
    //             top = (window.screen.height - height) / 2;
    //         }

    //         const popup = window.open(
    //             url,
    //             name,
    //             `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    //         );

    //         if (!popup) {
    //             reject(new Error('Popup was blocked. Please allow popups for this site.'));
    //             return;
    //         }

    //         // Tạo unique state để bảo mật
    //         const state = this.generateRandomState();

    //         // Lắng nghe message từ popup
    //         const messageListener = (event: MessageEvent) => {
    //             // Kiểm tra origin để bảo mật
    //             if (event.origin !== window.location.origin) {
    //                 return;
    //             }

    //             if (event.data.type === 'OAUTH_SUCCESS') {
    //                 window.removeEventListener('message', messageListener);
    //                 popup.close();
    //                 resolve({
    //                     success: true,
    //                     data: event.data.payload
    //                 });
    //             } else if (event.data.type === 'OAUTH_ERROR') {
    //                 window.removeEventListener('message', messageListener);
    //                 popup.close();
    //                 resolve({
    //                     success: false,
    //                     error: event.data.error || 'Authentication failed'
    //                 });
    //             }
    //         };

    //         window.addEventListener('message', messageListener);

    //         // Kiểm tra popup có bị đóng không
    //         const checkClosed = setInterval(() => {
    //             if (popup.closed) {
    //                 clearInterval(checkClosed);
    //                 window.removeEventListener('message', messageListener);
    //                 resolve({
    //                     success: false,
    //                     error: 'Authentication was cancelled'
    //                 });
    //             }
    //         }, 1000);

    //         // Timeout sau 5 phút
    //         setTimeout(() => {
    //             if (!popup.closed) {
    //                 popup.close();
    //                 window.removeEventListener('message', messageListener);
    //                 clearInterval(checkClosed);
    //                 resolve({
    //                     success: false,
    //                     error: 'Authentication timeout'
    //                 });
    //             }
    //         }, 5 * 60 * 1000);
    //     });
    // }

    /**
     * Tạo random state để bảo mật OAuth
     */
    private static generateRandomState(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    /**
     * Login với Google
     */
    static loginWithGoogle(): Promise<any> {
        return new Promise((resolve, reject) => {
            const state = Math.random().toString(36).substring(2, 15);
            const authUrl = `${this.baseURL}/auth/google?state=${state}`;
            console.log('Opening Google OAuth popup with URL:', authUrl);

            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const popup = window.open(
                authUrl,
                'google-login',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
            );

            if (!popup) {
                reject(new Error('Popup blocked. Please allow popups for this site.'));
                return;
            }

            let isResolved = false; // Flag để tránh resolve/reject nhiều lần

            const messageListener = (event: MessageEvent) => {
                console.log('Received message from popup:', event.data);
                console.log('Event origin:', event.origin);
                console.log('Current window origin:', window.location.origin);

                // Kiểm tra origin linh hoạt hơn
                const allowedOrigins = [
                    window.location.origin,
                    process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000',
                    process.env.REACT_APP_API_URL || 'http://localhost:5000',
                    'http://localhost:3000',
                    'http://localhost:5000'
                ];

                // Log để debug origin
                console.log('Allowed origins:', allowedOrigins);
                console.log('Event origin matches allowed:', allowedOrigins.includes(event.origin));

                // Tạm thời comment origin check để test
                if (!allowedOrigins.includes(event.origin)) {
                    console.warn('Blocked message from unauthorized origin:', event.origin);
                    return;
                }

                if (isResolved) return; // Tránh xử lý nhiều lần

                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    isResolved = true;
                    popup.close();
                    window.removeEventListener('message', messageListener);
                    clearInterval(checkClosed);

                    // LƯU TOKEN VÀO LOCALSTORAGE
                    if (event.data.payload) {
                        localStorage.setItem('accessToken', event.data.payload.accessToken);
                        localStorage.setItem('refreshToken', event.data.payload.refreshToken);
                    }

                    resolve({
                        success: true,
                        data: {
                            isNewUser: event.data.payload?.isNewUser,
                            state: event.data.state
                        }
                    });
                } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                    isResolved = true;
                    popup.close();
                    window.removeEventListener('message', messageListener);
                    clearInterval(checkClosed);

                    reject(new Error(event.data.error || 'Authentication failed'));
                }
            };

            window.addEventListener('message', messageListener);

            const checkClosed = setInterval(() => {
                if (popup.closed && !isResolved) {
                    isResolved = true;
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageListener);
                    reject(new Error('Authentication was cancelled'));
                }
            }, 500);

            setTimeout(() => {
                if (!popup.closed && !isResolved) {
                    isResolved = true;
                    popup.close();
                    window.removeEventListener('message', messageListener);
                    clearInterval(checkClosed);
                    reject(new Error('Authentication timeout'));
                }
            }, 5 * 60 * 1000);
        });
    }

    /**
     * Login với Facebook
     */
    static async loginWithFacebook(options?: OAuthPopupOptions): Promise<OAuthResponse> {
        try {
            const state = this.generateRandomState();
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const authUrl = `${this.baseURL}/auth/facebook?state=${state}`;
            const popup = window.open(
                authUrl,
                'facebook-login',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
            );

            if (!popup) {
                throw new Error('Popup was blocked. Please allow popups for this site.');
            }

            return await this.handleOAuthPopup(popup, state);
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to login with Facebook'
            };
        }
    }

    /**
     * GitHub OAuth (nếu cần)
     */
    static async loginWithGitHub(options?: OAuthPopupOptions): Promise<OAuthResponse> {
        try {
            const state = this.generateRandomState();
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const authUrl = `${this.baseURL}/auth/github?state=${state}`;
            const popup = window.open(
                authUrl,
                'github-login',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
            );

            if (!popup) {
                throw new Error('Popup was blocked. Please allow popups for this site.');
            }

            return await this.handleOAuthPopup(popup, state);
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to login with GitHub'
            };
        }
    }

    /**
     * Xử lý chung cho OAuth popup
     */
    private static handleOAuthPopup(popup: Window, state: string): Promise<OAuthResponse> {
        return new Promise((resolve, reject) => {
            const messageListener = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) {
                    return;
                }

                if (event.data.type === 'OAUTH_SUCCESS') {
                    window.removeEventListener('message', messageListener);
                    popup.close();
                    resolve({
                        success: true,
                        data: event.data.payload
                    });
                } else if (event.data.type === 'OAUTH_ERROR') {
                    window.removeEventListener('message', messageListener);
                    popup.close();
                    resolve({
                        success: false,
                        error: event.data.error || 'Authentication failed'
                    });
                }
            };

            window.addEventListener('message', messageListener);

            // Kiểm tra popup có bị đóng không
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageListener);
                    resolve({
                        success: false,
                        error: 'Authentication was cancelled'
                    });
                }
            }, 500);

            // Timeout sau 2 phút
            setTimeout(() => {
                if (!popup.closed) {
                    popup.close();
                    window.removeEventListener('message', messageListener);
                    clearInterval(checkClosed);
                    resolve({
                        success: false,
                        error: 'Authentication timeout'
                    });
                }
            }, 2 * 60 * 1000);
        });
    }
}

export default OAuthService;