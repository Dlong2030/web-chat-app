import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { selectAuth } from '../store/slices/authSlices';
import AuthService from '../services/authService';

export const useAuth = () => {
    const { isAuthenticated, user, accessToken } = useAppSelector(selectAuth);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const checkAuth = () => {
            const isValid = AuthService.isAuthenticated();
            if (!isValid && window.location.pathname !== '/login') {
                const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
                navigate(`/login?returnUrl=${returnUrl}`);
            }
        };

        checkAuth();
        // Check authentication status every 5 minutes
        const interval = setInterval(checkAuth, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [navigate, dispatch]);

    return {
        isAuthenticated,
        user,
        accessToken
    };
}; 