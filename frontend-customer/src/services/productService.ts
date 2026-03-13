import { apiClient } from './apiClient';
import type { Product, ProductFilters } from '../features/product/productSlice';

const PRODUCTS_PATH = import.meta.env.VITE_API_PRODUCTS_PATH ?? '/products';
const IS_STATIC_PRODUCTS = PRODUCTS_PATH.endsWith('.json');

const applyFilters = (items: Product[], params: ProductFilters = {}) => {
  const { category, brand, q } = params;
  let filtered = [...items];

  if (category) {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (brand) {
    filtered = filtered.filter((product) => product.brand === brand);
  }

  if (q) {
    const normalizedQuery = q.toLowerCase();
    filtered = filtered.filter((product) => product.name.toLowerCase().includes(normalizedQuery));
  }

  return filtered;
};

export const productService = {
  getAll: async (params: ProductFilters = {}): Promise<Product[]> => {
    if (IS_STATIC_PRODUCTS) {
      const items = await apiClient.get<Product[]>(PRODUCTS_PATH);
      return applyFilters(items, params);
    }

    return apiClient.get<Product[]>(PRODUCTS_PATH, params as Record<string, string | number | boolean | null | undefined>);
  },

  getById: async (id: number): Promise<Product> => {
    if (IS_STATIC_PRODUCTS) {
      const items = await apiClient.get<Product[]>(PRODUCTS_PATH);
      const found = items.find((product) => product.id === id);

      if (!found) {
        throw new Error('Product not found');
      }

      return found;
    }

    return apiClient.get<Product>(`${PRODUCTS_PATH}/${id}`);
  },
};
