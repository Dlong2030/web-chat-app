import React, { useState, ChangeEvent } from 'react';
import { Mail, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Link } from '../components/ui/Link';

// Interface definitions
interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    agreeToTerms: boolean;
}

interface RegisterFormErrors {
    email?: string;
    username?: string;
    password?: string;
    agreeToTerms?: string;
}

interface RegisterResponse {
    success: boolean;
    message?: string;
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

interface PandaChatRegisterProps {
    onRegister?: (data: RegisterFormData) => Promise<RegisterResponse> | RegisterResponse;
    onSignIn?: () => void;
    loading?: boolean;
}

const PandaChatRegister: React.FC<PandaChatRegisterProps> = ({
    onRegister,
    onSignIn,
    loading = false
}) => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        username: '',
        password: '',
        agreeToTerms: false
    });

    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof RegisterFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): RegisterFormErrors => {
        const newErrors: RegisterFormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Terms validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the Terms of Use';
        }

        return newErrors;
    };

    const handleSubmit = async (): Promise<void> => {
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);

            try {
                if (onRegister) {
                    const result = await onRegister(formData);
                    if (result.success) {
                        console.log('Registration successful:', result);
                        // Handle successful registration (redirect, show success message, etc.)
                    } else {
                        console.error('Registration failed:', result.message);
                        // Handle registration failure
                    }
                } else {
                    console.log('Registration attempt:', formData);
                    // Default behavior when no onRegister handler provided
                }
            } catch (error) {
                console.error('Registration error:', error);
                // Handle registration error
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleSignInClick = (): void => {
        navigate('/login');
    };

    const isFormDisabled = loading || isSubmitting;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                {/* Logo and Header */}
                <div className="mb-6 sm:mb-8">
                    <Logo
                        title="PandaChat"
                        subtitle="Get your PandaChat account now."
                    />
                </div>

                {/* Register Form */}
                <Card padding="lg" className="shadow-xl sm:shadow-2xl">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Email Field */}
                        <div>
                            <Input
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                icon={Mail}
                                error={errors.email}
                                disabled={isFormDisabled}
                                className="text-sm sm:text-base"
                            />
                        </div>

                        {/* Username Field */}
                        <div>
                            <Input
                                type="text"
                                name="username"
                                label="Username"
                                placeholder="Enter Username"
                                value={formData.username}
                                onChange={handleInputChange}
                                icon={User}
                                error={errors.username}
                                disabled={isFormDisabled}
                                className="text-sm sm:text-base"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Enter Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                icon={Lock}
                                error={errors.password}
                                disabled={isFormDisabled}
                                className="text-sm sm:text-base"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            loading={isSubmitting}
                            disabled={isFormDisabled}
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-3 sm:py-4"
                        >
                            Register
                        </Button>

                        {/* Terms Agreement */}
                        <div className="text-center">
                            <div className="flex items-start space-x-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="agreeToTerms"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    disabled={isFormDisabled}
                                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="agreeToTerms"
                                    className="text-xs sm:text-sm text-gray-600 text-left flex-1"
                                >
                                    I agree to the PandaChat{' '}
                                    <Link
                                        variant="primary"
                                        className="text-purple-600 hover:text-purple-700 transition-colors"
                                    >
                                        Terms of Use
                                    </Link>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <p className="text-xs sm:text-sm text-red-600 text-left">{errors.agreeToTerms}</p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Sign In Link */}
                <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-sm sm:text-base text-gray-600">
                        Already have an account?{' '}
                        <Link
                            variant="primary"
                            onClick={handleSignInClick}
                            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                            Signin
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

export default PandaChatRegister;