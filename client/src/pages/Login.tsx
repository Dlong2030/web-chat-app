import React, { useState, ChangeEvent, useEffect } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Link } from '../components/ui/Link';
import { useAppDispatch, useAppSelector } from '../store';
import {
    loginAsync,
    selectAuth,
    clearError,
    loginWithGoogleAsync,
    loginWithFacebookAsync,
    selectOAuthLoading
} from '../store/slices/authSlices';
import { LoginRequest } from '../types/auth.interfaces';
import { GoogleIcon, FacebookIcon, GitHubIcon } from '../components/icons/SocialIcons';

// Interface definitions
interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
    deviceToken?: string;
    deviceType?: 'web' | 'mobile' | 'desktop';
    deviceName?: string;
}

interface LoginFormErrors {
    email?: string;
    password?: string;
    general?: string;
}

interface PandaChatLoginProps {
    onSignup?: () => void;
    onForgotPassword?: () => void;
}

const PandaChatLogin: React.FC<PandaChatLoginProps> = ({
    onSignup,
    onForgotPassword
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoading, error, isAuthenticated } = useAppSelector(selectAuth);
    const oauthLoading = useAppSelector(selectOAuthLoading);

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
        deviceType: 'web',
        deviceName: navigator.userAgent || 'Unknown Device'
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<LoginFormErrors>({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            // Check for returnUrl in query parameters
            const params = new URLSearchParams(location.search);
            const returnUrl = params.get('returnUrl');
            const decodedReturnUrl = returnUrl ? decodeURIComponent(returnUrl) : '/dashboard';
            
            navigate(decodedReturnUrl, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Clear Redux error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Handle Redux error
    useEffect(() => {
        if (error) {
            setErrors(prev => ({
                ...prev,
                general: error
            }));
        }
    }, [error]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear errors when user starts typing
        if (errors[name as keyof LoginFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        // Clear general error when user interacts with form
        if (errors.general) {
            setErrors(prev => ({
                ...prev,
                general: undefined
            }));
            dispatch(clearError());
        }
    };

    const validateForm = (): LoginFormErrors => {
        const newErrors: LoginFormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Please enter your password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (): Promise<void> => {
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            // Prepare login request
            const loginRequest: LoginRequest = {
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
                deviceType: formData.deviceType,
                deviceName: formData.deviceName
            };

            // Get device token if available (for push notifications)
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    // Request notification permission and get device token
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        // Get FCM token here if using Firebase
                        // loginRequest.deviceToken = await getDeviceToken();
                    }
                } catch (error) {
                    console.warn('Failed to get device token:', error);
                }
            }

            // Dispatch login action
            const result = await dispatch(loginAsync(loginRequest));

            if (loginAsync.fulfilled.match(result)) {
                // Login successful - navigation will be handled by useEffect
                console.log('Login successful');

                // Save remember me preference
                if (formData.rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('savedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('savedEmail');
                }
            }
            // Error handling is done by Redux and useEffect
        }
    };

    const handleTogglePassword = (): void => {
        setShowPassword(prev => !prev);
    };

    const handleSignupClick = (): void => {
        if (onSignup) {
            onSignup();
        } else {
            navigate('/register');
        }
    };

    const handleForgotPasswordClick = (): void => {
        if (onForgotPassword) {
            onForgotPassword();
        } else {
            navigate('/forgot-password');
        }
    };

    // Xử lý OAuth message từ popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'OAUTH_SUCCESS') {
                navigate('/');
            } else if (event.data.type === 'OAUTH_ERROR') {
                setErrors(prev => ({
                    ...prev,
                    general: event.data.error || 'OAuth authentication failed'
                }));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [navigate]);

    // Cập nhật các hàm xử lý OAuth
    const handleGoogleLogin = async (): Promise<void> => {
        try {
            console.log('Starting Google login...');
            const result = await dispatch(loginWithGoogleAsync()).unwrap();
            
            if (result.success) {
                console.log('Google login successful');
                navigate('/dashboard');
            } else {
                console.error('Google login failed:', result);
                setErrors(prev => ({
                    ...prev,
                    general: 'Failed to login with Google. Please try again.'
                }));
            }
        } catch (error: any) {
            console.error('Google login error:', error);
            setErrors(prev => ({
                ...prev,
                general: error.message || 'Failed to login with Google. Please try again.'
            }));
        }
    };

    const handleFacebookLogin = async (): Promise<void> => {
        try {
            const result = await dispatch(loginWithFacebookAsync()).unwrap();
            if (result.success) {
                navigate('/');
            }
        } catch (error) {
            console.error('Facebook login error:', error);
            setErrors(prev => ({
                ...prev,
                general: 'Failed to login with Facebook. Please try again.'
            }));
        }
    };

    const handleGitHubLogin = async (): Promise<void> => {
        try {
            // Implement GitHub OAuth login
            console.log('GitHub login clicked');
            // window.location.href = '/auth/github';
            // Or use GitHub OAuth
        } catch (error) {
            console.error('GitHub login error:', error);
            setErrors(prev => ({
                ...prev,
                general: 'Failed to login with GitHub. Please try again.'
            }));
        }
    };

    // Load saved email on component mount
    useEffect(() => {
        const rememberMe = localStorage.getItem('rememberMe');
        const savedEmail = localStorage.getItem('savedEmail');

        if (rememberMe === 'true' && savedEmail) {
            setFormData(prev => ({
                ...prev,
                email: savedEmail,
                rememberMe: true
            }));
        }
    }, []);

    const isFormDisabled = isLoading;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                {/* Logo and Header */}
                <div className="mb-6 sm:mb-8">
                    <Logo
                        title=""
                        size="lg"
                        imageUrl="https://res.cloudinary.com/dnmp06kjg/image/upload/v1749984178/snapedit_1749984160484_ifftci.png"
                        imageAlt="My App Logo"
                    />
                </div>

                {/* Login Form */}
                <Card padding="lg" className="shadow-xl sm:shadow-2xl">
                    <div className="space-y-4 sm:space-y-6">
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                <p className="text-sm sm:text-base text-red-600">{errors.general}</p>
                            </div>
                        )}

                        {/* Social Login Buttons */}
                        <div className="space-y-3">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">Sign in with</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {/* Google Login */}
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isFormDisabled}
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {oauthLoading.google ? (
                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <GoogleIcon />
                                    )}
                                </button>

                                {/* Facebook Login */}
                                <button
                                    onClick={handleFacebookLogin}
                                    disabled={isFormDisabled}
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {oauthLoading.facebook ? (
                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FacebookIcon />
                                    )}
                                </button>

                                {/* GitHub Login */}
                                <button
                                    onClick={handleGitHubLogin}
                                    disabled={isFormDisabled}
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    <GitHubIcon />
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <Input
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                icon={User}
                                error={errors.email}
                                disabled={isFormDisabled}
                                autoComplete="email"
                                className="text-sm sm:text-base"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm sm:text-base font-medium text-gray-700">
                                    Password
                                </label>
                                <Link
                                    variant="primary"
                                    onClick={handleForgotPasswordClick}
                                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                icon={Lock}
                                rightIcon={showPassword ? EyeOff : Eye}
                                onRightIconClick={handleTogglePassword}
                                error={errors.password}
                                disabled={isFormDisabled}
                                autoComplete="current-password"
                                className="text-sm sm:text-base"
                            />
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <Checkbox
                                name="rememberMe"
                                label="Remember me"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                                disabled={isFormDisabled}
                                className="text-sm sm:text-base"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            loading={isLoading}
                            disabled={isFormDisabled}
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-3 sm:py-4"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </Card>

                {/* Sign Up Link */}
                <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-sm sm:text-base text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            variant="primary"
                            onClick={handleSignupClick}
                            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                            Signup now
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 sm:mt-8 text-center">
                    <p className="text-xs sm:text-sm text-gray-500">
                        © 2025 PandaChat. Crafted with{' '}
                        <span className="text-pink-500">♥</span>{' '}
                        by Dinh Long
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PandaChatLogin;