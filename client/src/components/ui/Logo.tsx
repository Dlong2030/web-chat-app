import React from 'react';

interface LogoProps {
    title: string;
    subtitle?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ title, subtitle, size = 'md' }) => {
    const sizeClasses = {
        sm: { icon: 'w-8 h-8', dot: 'w-3 h-3', title: 'text-lg', subtitle: 'text-sm' },
        md: { icon: 'w-12 h-12', dot: 'w-4 h-4', title: 'text-2xl', subtitle: 'text-base' },
        lg: { icon: 'w-16 h-16', dot: 'w-6 h-6', title: 'text-3xl', subtitle: 'text-lg' }
    };

    const classes = sizeClasses[size];

    return (
        <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center ${classes.icon} bg-indigo-600 rounded-lg mb-4`}>
                <div className={`${classes.icon.replace('w-', 'w-').replace('h-', 'h-').replace(/\d+/, (match) => String(parseInt(match) - 4))} bg-white rounded-full flex items-center justify-center`}>
                    <div className={`${classes.dot} bg-indigo-600 rounded-full`}></div>
                </div>
            </div>
            <h1 className={`${classes.title} font-bold text-gray-900 mb-2`}>{title}</h1>
            {subtitle && <p className={`${classes.subtitle} text-gray-600`}>{subtitle}</p>}
        </div>
    );
};
