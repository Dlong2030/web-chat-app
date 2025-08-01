import React from 'react';
import { LogoProps } from '../../types/sidebar.types';

const Logo: React.FC<LogoProps> = ({
    size = 'md',
    showText = true,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const textSizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl'
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${sizeClasses[size]} rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-6 h-6 text-white"
                >
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            {showText && (
                <h1 className={`${textSizeClasses[size]} font-bold bg-gradient-brand bg-clip-text text-transparent`}>
                    ChatApp
                </h1>
            )}
        </div>
    );
};

export default Logo;