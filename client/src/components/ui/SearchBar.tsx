import React from 'react';
import { SearchBarProps } from '../../types/sidebar.types';

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "Tìm kiếm cuộc trò chuyện...",
    className = ""
}) => {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="w-5 h-5 text-warm-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="
          w-full 
          pl-10 pr-4 py-3 
          bg-white/50 
          border border-warm-200 
          rounded-xl 
          text-warm-900 
          placeholder-warm-500
          focus:outline-none 
          focus:ring-2 
          focus:ring-brand-400/30 
          focus:border-brand-400
          transition-all duration-200
          backdrop-blur-sm
          hover:bg-white/70
        "
            />

            {value && (
                <button
                    onClick={() => onChange('')}
                    className="
            absolute inset-y-0 right-0 pr-3 
            flex items-center 
            text-warm-500 
            hover:text-warm-700
            transition-colors duration-200
          "
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;