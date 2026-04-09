import { apiClient } from './apiClient';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface BackendCategory {
  id: number | string;
  name: string;
}

const CATEGORIES_PATH = import.meta.env.VITE_API_CATEGORIES_PATH ?? '/categories';
const STATIC_CATEGORIES_URL =
  typeof window !== 'undefined' ? `${window.location.origin}/api/categories.json` : 'http://localhost/api/categories.json';

const categoryDefinitions: Record<string, Pick<Category, 'id' | 'icon'>> = {
  'điện thoại': { id: 'phones', icon: 'Smartphone' },
  laptop: { id: 'laptops', icon: 'Laptop' },
  tablet: { id: 'tablets', icon: 'Tablet' },
  'đồng hồ': { id: 'watches', icon: 'Watch' },
  'phụ kiện': { id: 'accessories', icon: 'Headphones' },
  pc: { id: 'pc', icon: 'Monitor' },
};

const isFrontendCategoryArray = (items: unknown): items is Category[] =>
  Array.isArray(items) &&
  items.every((item) => item && typeof item === 'object' && 'id' in item && 'name' in item);

const isBackendCategoryArray = (items: unknown): items is BackendCategory[] =>
  Array.isArray(items) &&
  items.every((item) => item && typeof item === 'object' && 'id' in item && 'name' in item);

const normalizeCategoryName = (value: string) => value.trim().toLowerCase();

const normalizeCategories = (items: unknown): Category[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  if (isFrontendCategoryArray(items) && items.some((item) => typeof item.id === 'string')) {
    return items;
  }

  if (!isBackendCategoryArray(items)) {
    return [];
  }

  return items.map((item) => {
    const normalizedName = normalizeCategoryName(item.name);
    const definition = categoryDefinitions[normalizedName];

    return {
      id: definition?.id ?? normalizedName.replace(/\s+/g, '-'),
      name: item.name,
      icon: definition?.icon ?? 'Smartphone',
    };
  });
};

const fetchCategoriesFromSource = async () => {
  try {
    const response = await apiClient.get<unknown>(CATEGORIES_PATH);
    const normalized = normalizeCategories(response);

    if (normalized.length > 0) {
      return normalized;
    }
  } catch {
    // Fallback to local data below when backend is unavailable in localhost dev.
  }

  const localResponse = await apiClient.get<unknown>(STATIC_CATEGORIES_URL);
  const normalizedLocalCategories = normalizeCategories(localResponse);

  if (normalizedLocalCategories.length > 0) {
    return normalizedLocalCategories;
  }

  throw new Error('Không tải được danh mục từ backend-customer hoặc dữ liệu dự phòng.');
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => fetchCategoriesFromSource(),
};
