import React, { ReactNode } from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: 'primary' | 'secondary';
    children: ReactNode;
}

export const Link: React.FC<LinkProps> = ({
    variant = 'primary',
    className = '',
    children,
    ...props
}) => {
    const variantClasses = {
        primary: 'text-indigo-600 hover:text-indigo-500',
        secondary: 'text-gray-600 hover:text-gray-500'
    };

    return (
        <a
            className={`font-medium transition-colors cursor-pointer ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </a>
    );
};
