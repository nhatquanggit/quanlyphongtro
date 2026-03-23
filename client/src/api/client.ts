const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

const normalizeApiBaseUrl = (value: string) => value.replace(/\/$/, '');

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);

// Backend origin for constructing asset URLs (e.g. avatar images)
export const BACKEND_ORIGIN = (() => {
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    try {
      return new URL(API_BASE_URL).origin;
    } catch {
      return window.location.origin;
    }
  }

  return window.location.origin;
})();

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type ApiRequestInit = RequestInit & {
  skipAuth?: boolean;
};

const isFormData = (value: unknown): value is FormData => typeof FormData !== 'undefined' && value instanceof FormData;

const toErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (Array.isArray(record.message)) return record.message.join(', ');
    if (typeof record.error === 'string') return record.error;
  }
  return fallback;
};

export const buildQueryString = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem('accessToken');

  if (!init.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !isFormData(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    throw new ApiError(toErrorMessage(payload, `Request failed with status ${response.status}`), response.status, payload);
  }

  return payload as T;
}

export const extractArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
  }
  return [];
};
