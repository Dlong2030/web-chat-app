import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';
import { LoginRequest, LoginResponse, User } from '../../types/auth.interfaces';

// Auth state interface
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

// Initial state
const initialState: AuthState = {
    user: AuthService.getStoredUser(),
    accessToken: AuthService.getAccessToken(),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    isAuthenticated: AuthService.isAuthenticated(),
    error: null,
};

// Async thunk cho login
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
            // Login cases
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

export default authSlice.reducer;