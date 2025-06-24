// store/slices/authSlices.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';
import OAuthService, { OAuthResponse } from '../../services/oauthService';
import { LoginRequest, LoginResponse, User } from '../../types/auth.interfaces';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    oauthLoading: {
        google: boolean;
        facebook: boolean;
        github: boolean;
    };
}

const initialState: AuthState = {
    user: AuthService.getStoredUser(),
    accessToken: AuthService.getAccessToken(),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    isAuthenticated: AuthService.isAuthenticated(),
    error: null,
    oauthLoading: {
        google: false,
        facebook: false,
        github: false,
    },
};

// Async thunk cho login thông thường
export const loginAsync = createAsyncThunk(
    'auth/login',
    async (loginData: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(loginData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

// Async thunk cho Google OAuth
export const loginWithGoogleAsync = createAsyncThunk(
    'auth/loginWithGoogle',
    async (_, { rejectWithValue }) => {
        try {
            const result = await OAuthService.loginWithGoogle();

            if (!result.success) {
                return rejectWithValue(result.error || 'Google login failed');
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.status}`);
                }

            const userData = await response.json();

                return {
                    success: true,
                    data: {
                        user: userData.data,
                        isNewUser: result.data?.isNewUser || false
                    }
                };
            } catch (fetchError: any) {
                console.error('Error fetching user data after OAuth:', fetchError);
                return rejectWithValue('Failed to fetch user data after authentication');
            }

        } catch (error: any) {
            console.error('Google OAuth error:', error);
            return rejectWithValue(error.message || 'Google login failed');
        }
    }
);

// Async thunk cho Facebook OAuth
export const loginWithFacebookAsync = createAsyncThunk(
    'auth/loginWithFacebook',
    async (_, { rejectWithValue }) => {
        try {
            const result = await OAuthService.loginWithFacebook();

            if (!result.success) {
                return rejectWithValue(result.error || 'Facebook login failed');
            }

            // Logic tương tự Google
            const user = AuthService.getStoredUser();
            const accessToken = AuthService.getAccessToken();
            const refreshToken = localStorage.getItem('refreshToken');

            if (!user || !accessToken) {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        data: {
                            user: data.data,
                            accessToken: accessToken!,
                            refreshToken: refreshToken!,
                            isNewUser: result.data?.isNewUser || false
                        }
                    };
                }
            }

            return {
                success: true,
                data: {
                    user,
                    accessToken,
                    refreshToken,
                    isNewUser: result.data?.isNewUser || false
                }
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Facebook login failed');
        }
    }
);

// Async thunk cho GitHub OAuth
export const loginWithGitHubAsync = createAsyncThunk(
    'auth/loginWithGitHub',
    async (_, { rejectWithValue }) => {
        try {
            const result = await OAuthService.loginWithGitHub();

            if (!result.success) {
                return rejectWithValue(result.error || 'GitHub login failed');
            }

            // Logic tương tự
            const user = AuthService.getStoredUser();
            const accessToken = AuthService.getAccessToken();
            const refreshToken = localStorage.getItem('refreshToken');

            return {
                success: true,
                data: {
                    user,
                    accessToken,
                    refreshToken,
                    isNewUser: result.data?.isNewUser || false
                }
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'GitHub login failed');
        }
    }
);

// Async thunk cho logout
export const logoutAsync = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await AuthService.logout();
            return null;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Reset auth state
        resetAuth: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            state.oauthLoading = {
                google: false,
                facebook: false,
                github: false,
            };
        },
        // Update user info
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        // Set tokens (for refresh token flow)
        setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('accessToken', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
    },
    extraReducers: (builder) => {
        builder
            // Regular login cases
            .addCase(loginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                if (action.payload.success && action.payload.data) {
                    state.user = action.payload.data.user;
                    state.accessToken = action.payload.data.accessToken;
                    state.refreshToken = action.payload.data.refreshToken;
                    state.isAuthenticated = true;
                }
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })

            // Google OAuth cases
            .addCase(loginWithGoogleAsync.pending, (state) => {
                state.oauthLoading.google = true;
                state.error = null;
            })
            .addCase(loginWithGoogleAsync.fulfilled, (state, action) => {
                state.oauthLoading.google = false;
                state.error = null;
                if (action.payload.success && action.payload.data) {
                    state.user = action.payload.data.user;
                    // state.accessToken = action.payload.data.accessToken;
                    // state.refreshToken = action.payload.data.refreshToken;
                    state.isAuthenticated = true;
                }
            })
            .addCase(loginWithGoogleAsync.rejected, (state, action) => {
                state.oauthLoading.google = false;
                state.error = action.payload as string;
            })

            // Facebook OAuth cases
            .addCase(loginWithFacebookAsync.pending, (state) => {
                state.oauthLoading.facebook = true;
                state.error = null;
            })
            .addCase(loginWithFacebookAsync.fulfilled, (state, action) => {
                state.oauthLoading.facebook = false;
                state.error = null;
                if (action.payload.success && action.payload.data) {
                    state.user = action.payload.data.user;
                    state.accessToken = action.payload.data.accessToken;
                    state.refreshToken = action.payload.data.refreshToken;
                    state.isAuthenticated = true;
                }
            })
            .addCase(loginWithFacebookAsync.rejected, (state, action) => {
                state.oauthLoading.facebook = false;
                state.error = action.payload as string;
            })

            // GitHub OAuth cases
            .addCase(loginWithGitHubAsync.pending, (state) => {
                state.oauthLoading.github = true;
                state.error = null;
            })
            .addCase(loginWithGitHubAsync.fulfilled, (state, action) => {
                state.oauthLoading.github = false;
                state.error = null;
                if (action.payload.success && action.payload.data) {
                    state.user = action.payload.data.user;
                    state.accessToken = action.payload.data.accessToken;
                    state.refreshToken = action.payload.data.refreshToken;
                    state.isAuthenticated = true;
                }
            })
            .addCase(loginWithGitHubAsync.rejected, (state, action) => {
                state.oauthLoading.github = false;
                state.error = action.payload as string;
            })

            // Logout cases
            .addCase(logoutAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutAsync.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
                state.oauthLoading = {
                    google: false,
                    facebook: false,
                    github: false,
                };
            })
            .addCase(logoutAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                // Vẫn logout dù có lỗi
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            });
    },
});

// Export actions
export const { clearError, resetAuth, updateUser, setTokens } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectOAuthLoading = (state: { auth: AuthState }) => state.auth.oauthLoading;

export default authSlice.reducer;