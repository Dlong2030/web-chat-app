import { LoginRequest, LoginResponse } from '../types/auth.types';
import axios from 'axios';
import axiosInstance from '../api/axios';

class AuthService {
    private static baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

    static async login(loginData: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await axiosInstance.post(`${this.baseURL}/auth/login`, loginData);
            const data: LoginResponse = response.data;

            if (data.success && data.data) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            return data;
        } catch (error: any) {
            const status = error.response?.status;
            const errData = error.response?.data;

            switch (status) {
                case 400:
                    throw new Error(errData?.error || 'Validation failed');
                case 401:
                    throw new Error('Invalid credentials');
                case 403:
                    throw new Error('Account disabled');
                default:
                    throw new Error(errData?.error || 'Login failed');
            }
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

    static async getUserData(accessToken: string) {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/auth/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            console.log('User data fetched successfully:', response.data);
            return response.data;

        } catch (error: any) {
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch user data'
            );
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