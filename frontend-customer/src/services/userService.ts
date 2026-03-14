import { apiClient } from './apiClient';

export interface User {
  id: number;
  name: string;
}

const USERS_BASE =
  import.meta.env.VITE_API_USERS_URL ??
  import.meta.env.VITE_API_USERS_PATH ??
  'https://da2-sever-nodejs.onrender.com/users';

const base = () => USERS_BASE.replace(/\/+$/, '');

export const userService = {
  getBaseUrl: () => base(),

  getAll: async (): Promise<User[]> => apiClient.get<User[]>(base()),

  getById: async (id: number): Promise<User> => apiClient.get<User>(`${base()}/${id}`),

  create: async (name: string): Promise<User> =>
    apiClient.post<User>(base(), { name }),

  update: async (id: number, name: string): Promise<User> =>
    apiClient.put<User>(`${base()}/${id}`, { name }),

  delete: async (id: number): Promise<void> =>
    apiClient.delete<void>(`${base()}/${id}`),
};
