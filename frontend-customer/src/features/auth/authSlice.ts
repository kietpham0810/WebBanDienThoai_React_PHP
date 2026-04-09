import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, LoginResponse } from '../../services/authService';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const storage = typeof window !== 'undefined' ? window.localStorage : null;

const readStoredUser = (): AuthUser | null => {
  const rawUser = storage?.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

const storedToken = storage?.getItem('token') ?? null;

const initialState: AuthState = {
  user: readStoredUser(),
  token: storedToken,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      storage?.setItem('user', JSON.stringify(action.payload.user));
      storage?.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      storage?.removeItem('user');
      storage?.removeItem('token');
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      storage?.setItem('user', JSON.stringify(action.payload));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
