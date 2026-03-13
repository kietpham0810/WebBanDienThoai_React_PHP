import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  specs: {
    ram?: string;
    storage?: string;
    screen?: string;
  };
  description?: string;
  images?: string[];
}

export interface ProductFilters {
  category?: string | null;
  brand?: string | null;
  q?: string | null;
}

interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[], ProductFilters | undefined>(
  'product/fetchProducts',
  async (params = {}) => {
    const response = await productService.getAll(params);
    return response;
  },
);

export const fetchProductById = createAsyncThunk<Product, number>(
  'product/fetchProductById',
  async (id) => {
    const response = await productService.getById(id);
    return response;
  },
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Không tải được danh sách sản phẩm.';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Không tải được sản phẩm.';
        state.selectedProduct = null;
      });
  },
});

export default productSlice.reducer;
