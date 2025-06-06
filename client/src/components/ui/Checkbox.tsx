import React, { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <div className="flex items-center">
                    <input
                        ref={ref}
                        type="checkbox"
                        className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                        {...props}
                    />
                    {label && <label className="ml-2 block text-sm text-gray-700">{label}</label>}
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
