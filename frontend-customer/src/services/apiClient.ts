export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: string;
  params?: QueryParams;
  headers?: HeadersInit;
  body?: unknown;
  timeoutMs?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const APP_URL = import.meta.env.VITE_APP_URL ?? '';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);
const WITH_CREDENTIALS = String(import.meta.env.VITE_API_WITH_CREDENTIALS ?? 'false') === 'true';

const normalizeBase = (value: string) => value.replace(/\/+$/, '');
const normalizePath = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const resolveBaseUrl = () => {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    return API_BASE_URL;
  }

  if (APP_URL) {
    return `${normalizeBase(APP_URL)}${normalizePath(API_BASE_URL)}`;
  }

  return API_BASE_URL;
};

const resolveUrl = (path: string, params?: QueryParams) => {
  const base = resolveBaseUrl();
  const fullPath = path.startsWith('http://') || path.startsWith('https://')
    ? path
    : `${normalizeBase(base)}${normalizePath(path)}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(fullPath, origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
};

const isHtmlPayload = (contentType: string, payload: unknown) => {
  if (contentType.includes('text/html')) {
    return true;
  }

  const message =
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string'
      ? payload.message
      : '';

  return /<!doctype html>|<html/i.test(message);
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const url = resolveUrl(path, options.params);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? API_TIMEOUT);

  const headers = new Headers(options.headers ?? {});
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const body: BodyInit | null | undefined =
    hasBody && !isFormData && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | null | undefined);

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      body,
      headers,
      credentials: WITH_CREDENTIALS ? 'include' : 'omit',
      signal: controller.signal,
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      const message =
        (payload && (payload.message || payload.error)) ||
        `${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    if (isHtmlPayload(response.headers.get('content-type') ?? '', payload)) {
      throw new Error('API trả về HTML thay vì JSON. Hãy kiểm tra lại URL API hoặc cấu hình proxy.');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
};

export const apiClient = {
  get: async <T>(path: string, params?: QueryParams) => request<T>(path, { params, method: 'GET' }),
  post: async <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: async <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: async <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: async <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
