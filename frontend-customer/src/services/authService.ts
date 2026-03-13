import { apiClient } from './apiClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

const LOGIN_PATH = import.meta.env.VITE_API_LOGIN_PATH ?? '/auth/login';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>(LOGIN_PATH, { email, password }),
};
