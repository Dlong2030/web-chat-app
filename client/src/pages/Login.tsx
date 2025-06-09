import React, { useState, ChangeEvent, useEffect } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Link } from '../components/ui/Link';
import { useAppDispatch, useAppSelector } from '../store';
import { loginAsync, selectAuth, clearError } from '../store/slices/authSlices';
import { LoginRequest } from '../types/auth.interfaces';

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
    const { isLoading, error, isAuthenticated } = useAppSelector(selectAuth);

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
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

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
                        title="PandaChat"
                        subtitle="Sign in to continue to PandaChat."
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