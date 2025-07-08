import React from 'react';

interface LogoProps {
    title: string;
    subtitle?: string;
    size?: 'sm' | 'md' | 'lg';
    imageUrl?: string;
    imageAlt?: string;
}

export const Logo: React.FC<LogoProps> = ({
    title,
    subtitle,
    size = 'md',
    imageUrl,
    imageAlt = 'Logo'
}) => {
    const sizeClasses = {
        sm: {
            container: 'w-12 h-12',
            image: 'w-12 h-12',
            dot: 'w-4 h-4',
            title: 'text-lg',
            subtitle: 'text-sm'
        },
        md: {
            container: 'w-16 h-16',
            image: 'w-16 h-16',
            dot: 'w-5 h-5',
            title: 'text-2xl',
            subtitle: 'text-base'
        },
        lg: {
            container: 'w-36 h-36',
            image: 'w-36 h-36',
            dot: 'w-8 h-8',
            title: 'text-3xl',
            subtitle: 'text-lg'
        }
    };

    const classes = sizeClasses[size];

    // Tính toán kích thước inner circle (nhỏ hơn 4 đơn vị so với container)
    const getInnerSize = (containerClass: string) => {
        const match = containerClass.match(/w-(\d+)/);
        if (match) {
            const size = parseInt(match[1]) - 4;
            return `w-${size} h-${size}`;
        }
        return 'w-8 h-8'; // fallback
    };

    return (
        <div className="flex items-center justify-center text-center">
            <div className={`inline-flex items-center justify-center ${classes.container} rounded-lg mb-4 overflow-hidden`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={imageAlt}
                        className={`${classes.image} object-cover rounded-lg`}
                    />
                ) : (
                    <div className={`${getInnerSize(classes.container)} bg-white rounded-full flex items-center justify-center`}>
                        <div className={`${classes.dot} bg-indigo-600 rounded-full`}></div>
                    </div>
                )}
            </div>
            <h1 className={`${classes.title} font-bold text-gray-900 mb-2`}>{title}</h1>
            {subtitle && <p className={`${classes.subtitle} text-gray-600`}>{subtitle}</p>}
        </div>
    );
};