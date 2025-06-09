import { LoginRequest, LoginResponse, ApiError, User } from '../types/auth.interfaces';

class AuthService {
    private static baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

    static async login(loginData: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const data: LoginResponse | ApiError = await response.json();

            if (!response.ok) {
                // Xử lý các loại lỗi khác nhau
                if (response.status === 400) {
                    throw new Error(data.error || 'Validation failed');
                } else if (response.status === 401) {
                    throw new Error('Invalid credentials');
                } else if (response.status === 403) {
                    throw new Error('Account disabled');
                } else {
                    throw new Error(data.error || 'Login failed');
                }
            }

            // Lưu tokens vào localStorage
            if (data.success && data.data) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            return data as LoginResponse;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    }

    static async logout(): Promise<void> {
        try {
            await fetch(`${this.baseURL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    }

    static getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    static isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}

export default AuthService;