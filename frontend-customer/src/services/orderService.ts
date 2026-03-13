import { apiClient } from './apiClient';

export interface OrderItemPayload {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderPayload {
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: 'cod' | 'banking';
  items: OrderItemPayload[];
  total: number;
}

const ORDERS_PATH = import.meta.env.VITE_API_ORDERS_PATH ?? '/orders';

export const orderService = {
  create: async (payload: OrderPayload) => apiClient.post(ORDERS_PATH, payload),
};
