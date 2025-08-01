import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
    displayName: string;
    email: string;
    avatarUrl?: string;
    status: string;
}

interface UserProfileDropdownProps {
    userData: UserData;
    onClose: () => void;
    onNavigateToProfile: () => void; // New prop for navigation
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
    userData,
    onClose,
    onNavigateToProfile
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(userData.displayName);
    const [editEmail, setEditEmail] = useState(userData.email);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
    };

    const handleProfileClick = () => {
        onNavigateToProfile();
        onClose(); // Close dropdown after navigation
    };

    const handleOpenProfile = () => {
        navigate(`/${userData.displayName}`);
        onClose(); // Close dropdown after navigation
    };

    return (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-warm-200 z-50 animate-slide-down">
            <div className="p-4 border-b border-warm-100">
                <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 flex items-center justify-center text-white">
                        <span className="text-xl font-semibold">{userData.displayName.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-warm-900">{userData.displayName}</h3>
                        <p className="text-sm text-warm-500">{userData.email}</p>
                    </div>
                    {/* User Profile Icon */}
                    <button
                        onClick={handleProfileClick}
                        className="p-2 rounded-full hover:bg-brand-50 transition-colors group"
                        title="Go to profile"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-brand-600 group-hover:text-brand-700"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* <div className="p-4 border-b border-warm-100">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-warm-600">Status</span>
                    <div className="flex space-x-2">
                        <button
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-warm-100 text-warm-600'}`}
                            onClick={() => setStatus('Online')}
                        >
                            Online
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Away' ? 'bg-yellow-100 text-yellow-800' : 'bg-warm-100 text-warm-600'}`}
                            onClick={() => setStatus('Away')}
                        >
                            Away
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Offline' ? 'bg-gray-100 text-gray-800' : 'bg-warm-100 text-warm-600'}`}
                            onClick={() => setStatus('Offline')}
                        >
                            Offline
                        </button>
                    </div>
                </div>
            </div> */}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="p-4 border-b border-warm-100">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-warm-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                            required
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg transition-colors"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-700 py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-4 border-b border-warm-100">
                    <button
                        // onClick={() => setIsEditing(true)}
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span>Edit Profile</span>
                    </button>
                </div>
            )}

            <div className="p-2">
                <button
                    onClick={onClose}
                    className="w-full py-3 text-center text-warm-700 hover:bg-warm-100 rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default UserProfileDropdown;