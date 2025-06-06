import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        loading = false,
        leftIcon: LeftIcon,
        rightIcon: RightIcon,
        children,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
        const variantClasses = {
            primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
            secondary: 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500',
            outline: 'text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
            ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
        };
        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-sm',
            lg: 'px-6 py-4 text-base'
        };

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : (
                    <>
                        {LeftIcon && <LeftIcon className="w-5 h-5 mr-2" />}
                        {children}
                        {RightIcon && <RightIcon className="w-5 h-5 ml-2" />}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
