import { apiClient } from './apiClient';
import type { Product, ProductFilters } from '../features/product/productSlice';

interface BackendProduct {
  id: number;
  name: string;
  price: number | string;
  description?: string | null;
  image?: string | null;
  category_id?: number | string | null;
}

const PRODUCTS_PATH = import.meta.env.VITE_API_PRODUCTS_PATH ?? '/products';
const STATIC_PRODUCTS_URL =
  typeof window !== 'undefined' ? `${window.location.origin}/api/products.json` : 'http://localhost/api/products.json';

const categoryById: Record<string, Product['category']> = {
  '1': 'phones',
  '2': 'laptops',
  '3': 'tablets',
  '4': 'watches',
  '5': 'accessories',
};

const placeholderImages: Record<Product['category'], string[]> = {
  phones: ['/images/products/iphone1.avif', '/images/products/samsung.avif', '/images/products/oppo.jpg'],
  laptops: ['/images/products/laptop1.jpg', '/images/products/laptop2.jpg', '/images/products/laptop3.jpg'],
  tablets: ['/images/products/iphone2.jpg', '/images/products/samsung4.jpg', '/images/products/xiaomi.jpg'],
  watches: ['/images/products/applewatch1.jpg', '/images/products/applewatch5.jpg'],
  accessories: ['/images/products/tainghe.jpg', '/images/products/chuotkhongday.jpg', '/images/products/chuotkhongday2.jpg'],
  pc: ['/images/products/pc1.jpg', '/images/products/manhinh1.jpg', '/images/products/pc2.jpg'],
};

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

const isFrontendProductArray = (items: unknown): items is Product[] =>
  Array.isArray(items) &&
  items.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      'id' in item &&
      'name' in item &&
      'price' in item &&
      'category' in item,
  );

const isBackendProductArray = (items: unknown): items is BackendProduct[] =>
  Array.isArray(items) &&
  items.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      'id' in item &&
      'name' in item &&
      'price' in item &&
      'category_id' in item,
  );

const inferBrand = (name: string) => name.trim().split(/\s+/)[0]?.toLowerCase() || 'novatech';

const pickPlaceholderImage = (category: Product['category'], id: number) => {
  const choices = placeholderImages[category] ?? placeholderImages.phones;
  return choices[(id - 1) % choices.length];
};

const resolveCategory = (item: BackendProduct): Product['category'] => {
  const mappedCategory = categoryById[String(item.category_id ?? '')];

  if (mappedCategory) {
    return mappedCategory;
  }

  const normalizedName = item.name.toLowerCase();

  if (normalizedName.includes('watch')) return 'watches';
  if (normalizedName.includes('laptop') || normalizedName.includes('macbook')) return 'laptops';
  if (normalizedName.includes('ipad') || normalizedName.includes('tablet')) return 'tablets';
  if (normalizedName.includes('tai nghe') || normalizedName.includes('chuột') || normalizedName.includes('phụ kiện')) {
    return 'accessories';
  }

  return 'phones';
};

const normalizeProducts = (items: unknown): Product[] => {
  if (isFrontendProductArray(items)) {
    return items;
  }

  if (!isBackendProductArray(items)) {
    return [];
  }

  return items.map((item) => {
    const category = resolveCategory(item);

    return {
      id: Number(item.id),
      name: item.name,
      price: Number(item.price ?? 0),
      image: pickPlaceholderImage(category, Number(item.id)),
      images: [pickPlaceholderImage(category, Number(item.id))],
      category,
      brand: inferBrand(item.name),
      rating: 4.6,
      reviews: 0,
      specs: {},
      description: item.description ?? undefined,
    };
  });
};

const fetchProductsFromSource = async () => {
  try {
    const response = await apiClient.get<unknown>(PRODUCTS_PATH);
    const normalized = normalizeProducts(response);

    if (normalized.length > 0) {
      return normalized;
    }
  } catch {
    // Fallback to local data below when backend is unavailable in localhost dev.
  }

  const localResponse = await apiClient.get<unknown>(STATIC_PRODUCTS_URL);
  const normalizedLocalProducts = normalizeProducts(localResponse);

  if (normalizedLocalProducts.length > 0) {
    return normalizedLocalProducts;
  }

  throw new Error('Không tải được danh sách sản phẩm từ backend-customer hoặc dữ liệu dự phòng.');
};

export const productService = {
  getAll: async (params: ProductFilters = {}): Promise<Product[]> => {
    const items = await fetchProductsFromSource();
    return applyFilters(items, params);
  },

  getById: async (id: number): Promise<Product> => {
    const items = await fetchProductsFromSource();
    const found = items.find((product) => product.id === id);

    if (!found) {
      throw new Error('Product not found');
    }

    return found;
  },
};
