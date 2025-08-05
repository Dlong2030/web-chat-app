import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Gắn token vào tất cả các request nếu có
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Xử lý lỗi trả về từ server
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Lỗi từ server
            if (error.response.status === 401) {
                // Xử lý lỗi không có quyền truy cập
                console.error('Unauthorized access - redirecting to login');
                window.location.href = '/login';
            } else {
                console.error('Error response from server:', error.response.data);
            }
        } else if (error.request) {
            // Không nhận được phản hồi từ server
            console.error('No response received:', error.request);
        } else {
            // Lỗi khác
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;