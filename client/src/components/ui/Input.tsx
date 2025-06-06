import React, { forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    rightIcon?: LucideIcon;
    onRightIconClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'error';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label, error, icon: Icon, rightIcon: RightIcon, onRightIconClick,
    size = 'md', variant = 'default', className = '', ...props
}, ref) => {
    const sizeClasses = {
        sm: 'py-2 text-sm',
        md: 'py-3 text-sm',
        lg: 'py-4 text-base'
    };

    const variantClasses = {
        default: 'border-gray-300 hover:border-gray-400 focus:border-indigo-500',
        error: 'border-red-300 bg-red-50'
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
            <div className="relative">
                {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-gray-400" /></div>}
                <input
                    ref={ref}
                    className={`block w-full rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
            ${Icon ? 'pl-10' : 'pl-3'} ${RightIcon ? 'pr-10' : 'pr-3'}
            ${sizeClasses[size]} ${variantClasses[error ? 'error' : 'default']}
            disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                    {...props}
                />
                {RightIcon && <button type="button" onClick={onRightIconClick} className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={props.disabled}><RightIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
