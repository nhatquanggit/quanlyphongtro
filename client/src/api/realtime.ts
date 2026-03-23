import { API_BASE_URL } from './client';

const DEFAULT_WS_PORT = import.meta.env.VITE_WS_PORT ?? '3001';
const RAW_WS_URL = import.meta.env.VITE_WS_URL;

const toWebSocketUrl = (value: string) => {
  if (/^wss?:\/\//i.test(value)) return value;

  if (value.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${value}`;
  }

  return value;
};

const createFallbackWsUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (API_BASE_URL.startsWith('/')) {
    return `${protocol}//${window.location.host}/ws`;
  }

  try {
    const apiUrl = new URL(API_BASE_URL);
    return `${protocol}//${apiUrl.hostname}:${DEFAULT_WS_PORT}`;
  } catch {
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:${DEFAULT_WS_PORT}`;
  }
};

export const CHAT_WS_URL = RAW_WS_URL ? toWebSocketUrl(RAW_WS_URL) : createFallbackWsUrl();