import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const OAuthCallback: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const handleCallback = () => {
            const urlParams = new URLSearchParams(location.search);
            const error = urlParams.get('error');
            const message = urlParams.get('message');
            const newUser = urlParams.get('newUser');

            if (window.opener) {
                if (error || message) {
                    window.opener.postMessage({
                        type: 'OAUTH_ERROR',
                        error: message || error || 'Authentication failed'
                    }, window.location.origin);
                } else {
                    window.opener.postMessage({
                        type: 'OAUTH_SUCCESS',
                        payload: {
                            isNewUser: newUser === 'true'
                        }
                    }, window.location.origin);
                }
            }
            window.close();
        };

        handleCallback();
    }, [location]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;