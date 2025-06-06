import React, { useState, ChangeEvent } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Link } from '../components/ui/Link';

// Interface definitions
interface LoginFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

interface LoginFormErrors {
    username?: string;
    password?: string;
}

interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

interface PandaChatLoginProps {
    onLogin?: (data: LoginFormData) => Promise<LoginResponse> | LoginResponse;
    onSignup?: () => void;
    onForgotPassword?: () => void;
    loading?: boolean;
}

const PandaChatLogin: React.FC<PandaChatLoginProps> = ({
    onLogin,
    onSignup,
    onForgotPassword,
    loading = false
}) => {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
        rememberMe: false
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof LoginFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): LoginFormErrors => {
        const newErrors: LoginFormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Please Enter Your Username';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
            newErrors.username = 'Please enter a valid email address';
        }

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
            setIsSubmitting(true);

            try {
                if (onLogin) {
                    const result = await onLogin(formData);
                    if (result.success) {
                        console.log('Login successful:', result);
                        // Handle successful login (redirect, store token, etc.)
                    } else {
                        console.error('Login failed:', result.message);
                        // Handle login failure
                    }
                } else {
                    console.log('Login attempt:', formData);
                    // Default behavior when no onLogin handler provided
                }
            } catch (error) {
                console.error('Login error:', error);
                // Handle login error
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleTogglePassword = (): void => {
        setShowPassword(prev => !prev);
    };

    const handleSignupClick = (): void => {
        // if (onSignup) {
        //     onSignup();
        // } else {
        //     console.log('Signup clicked');
        // }
        navigate('/register'); // Redirect to the signup page
    };

    const handleForgotPasswordClick = (): void => {
        if (onForgotPassword) {
            onForgotPassword();
        } else {
            console.log('Forgot password clicked');
        }
    };

    const isFormDisabled = loading || isSubmitting;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <Logo
                    title="PandaChat"
                    subtitle="Sign in to continue to PandaChat."
                />

                {/* Login Form */}
                <Card padding="lg">
                    <div className="space-y-6">
                        {/* Username Field */}
                        <Input
                            type="email"
                            name="username"
                            label="Username"
                            placeholder="Enter email"
                            value={formData.username}
                            onChange={handleInputChange}
                            icon={User}
                            error={errors.username}
                            disabled={isFormDisabled}
                        />

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link
                                    variant="primary"
                                    onClick={handleForgotPasswordClick}
                                    className="text-sm"
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
                            />
                        </div>

                        {/* Remember Me Checkbox */}
                        <Checkbox
                            name="rememberMe"
                            label="Remember me"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            disabled={isFormDisabled}
                        />

                        {/* Submit Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            loading={isSubmitting}
                            disabled={isFormDisabled}
                            onClick={handleSubmit}
                            className="w-full"
                        >
                            Sign in
                        </Button>
                    </div>
                </Card>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            variant="primary"
                            onClick={handleSignupClick}
                        >
                            Signup now
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        © 2025 PandaChat. Crafted with{' '}
                        <span className="text-red-500">♥</span>{' '}
                        by Themesbrand
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PandaChatLogin;