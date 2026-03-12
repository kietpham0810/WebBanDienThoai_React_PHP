import { mockProducts } from '../data/mockData';
import type { Product, ProductFilters } from '../features/product/productSlice';

const MOCK_DELAY = 800;

export const productService = {
  getAll: async (params: ProductFilters = {}): Promise<Product[]> => {
    return new Promise<Product[]>((resolve) => {
      setTimeout(() => {
        const { category, brand, q } = params;
        let filtered = [...mockProducts];

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

        resolve(filtered);
      }, MOCK_DELAY);
    });
  },

  getById: async (id: number): Promise<Product> => {
    return new Promise<Product>((resolve, reject) => {
      setTimeout(() => {
        const product = mockProducts.find((item) => item.id === Number(id));

        if (product) {
          resolve(product);
          return;
        }

        reject(new Error('Product not found'));
      }, MOCK_DELAY);
    });
  },
};
