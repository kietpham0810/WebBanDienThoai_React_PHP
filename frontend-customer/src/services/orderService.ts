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

interface LocalOrderRecord {
  id: number;
  user_id: number;
  order_date: string;
  total: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItemPayload[];
}

const ORDERS_PATH = import.meta.env.VITE_API_ORDERS_PATH ?? '/orders';
const LOCAL_ORDERS_STORAGE_KEY = 'novatech-local-orders';

const storage = typeof window !== 'undefined' ? window.localStorage : null;

const readStoredOrders = (): LocalOrderRecord[] => {
  const rawOrders = storage?.getItem(LOCAL_ORDERS_STORAGE_KEY);

  if (!rawOrders) {
    return [];
  }

  try {
    const parsedOrders = JSON.parse(rawOrders);
    return Array.isArray(parsedOrders) ? parsedOrders : [];
  } catch {
    return [];
  }
};

const persistStoredOrders = (orders: LocalOrderRecord[]) => {
  storage?.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

const formatOrderDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const resolveUserId = () => {
  const rawUser = storage?.getItem('user');

  if (!rawUser) {
    return 1;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as { id?: string | number };
    const numericId = Number(parsedUser.id);
    return Number.isInteger(numericId) && numericId > 0 ? numericId : 1;
  } catch {
    return 1;
  }
};

const createLocalOrderRecord = (payload: OrderPayload): LocalOrderRecord => {
  const storedOrders = readStoredOrders();
  const nextId = storedOrders.length > 0 ? Math.max(...storedOrders.map((order) => order.id)) + 1 : 1;

  const orderRecord: LocalOrderRecord = {
    id: nextId,
    user_id: resolveUserId(),
    order_date: formatOrderDate(),
    total: payload.total,
    status: 'pending',
    shipping_address: payload.address,
    payment_method: payload.paymentMethod,
    customer_name: payload.fullName,
    customer_phone: payload.phone,
    items: payload.items,
  };

  persistStoredOrders([...storedOrders, orderRecord]);
  return orderRecord;
};

export const orderService = {
  create: async (payload: OrderPayload) => {
    const backendPayload = {
      user_id: resolveUserId(),
      total: payload.total,
      status: 'pending',
      order_date: formatOrderDate(),
      shipping_address: payload.address,
      payment_method: payload.paymentMethod,
    };

    try {
      return await apiClient.post(ORDERS_PATH, backendPayload);
    } catch {
      return createLocalOrderRecord(payload);
    }
  },
};
