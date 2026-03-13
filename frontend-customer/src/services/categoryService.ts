import { apiClient } from './apiClient';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

const CATEGORIES_PATH = import.meta.env.VITE_API_CATEGORIES_PATH ?? '/categories';

export const categoryService = {
  getAll: async (): Promise<Category[]> => apiClient.get<Category[]>(CATEGORIES_PATH),
};
