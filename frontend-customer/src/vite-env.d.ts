/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_API_WITH_CREDENTIALS?: string;
  readonly VITE_API_PRODUCTS_PATH?: string;
  readonly VITE_API_CATEGORIES_PATH?: string;
  readonly VITE_API_LOGIN_PATH?: string;
  readonly VITE_API_ORDERS_PATH?: string;
  readonly VITE_API_USERS_PATH?: string;
  readonly VITE_API_USERS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
