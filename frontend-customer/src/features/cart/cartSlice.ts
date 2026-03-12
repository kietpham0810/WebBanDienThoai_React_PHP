import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const storage = typeof window !== 'undefined' ? window.localStorage : null;

const calculateTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

const readCartItems = (): CartItem[] => {
  const rawItems = storage?.getItem('cart_items');

  if (!rawItems) {
    return [];
  }

  try {
    const parsedItems = JSON.parse(rawItems);
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    return [];
  }
};

const persistCart = (items: CartItem[]) => {
  storage?.setItem('cart_items', JSON.stringify(items));
};

const initialItems = readCartItems();

const initialState: CartState = {
  items: initialItems,
  totalAmount: calculateTotal(initialItems),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }

      state.totalAmount = calculateTotal(state.items);
      persistCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.totalAmount = calculateTotal(state.items);
      persistCart(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);

      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        state.totalAmount = calculateTotal(state.items);
        persistCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      storage?.removeItem('cart_items');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
