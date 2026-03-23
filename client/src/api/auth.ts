import { apiRequest } from './client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar: string | null;
}

export interface AuthSession {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  fullName: string;
  phone?: string;
  role?: string;
}

const normalizeAuthSession = (payload: unknown, fallbackMessage: string): AuthSession => {
  const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const nestedUser = (record.user && typeof record.user === 'object' ? record.user : {}) as Record<string, unknown>;

  const accessToken =
    (typeof record.accessToken === 'string' && record.accessToken) ||
    (typeof record.token === 'string' && record.token) ||
    '';

  return {
    message: typeof record.message === 'string' ? record.message : fallbackMessage,
    accessToken,
    refreshToken: typeof record.refreshToken === 'string' ? record.refreshToken : '',
    user: {
      id:
        (typeof nestedUser.id === 'string' && nestedUser.id) ||
        (typeof record.id === 'string' ? record.id : ''),
      email:
        (typeof nestedUser.email === 'string' && nestedUser.email) ||
        (typeof record.email === 'string' ? record.email : ''),
      fullName:
        (typeof nestedUser.fullName === 'string' && nestedUser.fullName) ||
        (typeof record.fullName === 'string' ? record.fullName : ''),
      phone:
        (typeof nestedUser.phone === 'string' && nestedUser.phone) ||
        (typeof record.phone === 'string' ? record.phone : ''),
      role:
        (typeof nestedUser.role === 'string' && nestedUser.role) ||
        (typeof record.role === 'string' ? record.role : 'ADMIN'),
      avatar:
        nestedUser.avatar === null || typeof nestedUser.avatar === 'string'
          ? (nestedUser.avatar as string | null)
          : null,
    },
  };
};

export const login = async (body: LoginPayload) => {
  const payload = await apiRequest<unknown>('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify(body),
  });

  return normalizeAuthSession(payload, 'Login successful');
};

export const register = async (body: RegisterPayload) => {
  const payload = await apiRequest<unknown>('/auth/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify(body),
  });

  return normalizeAuthSession(payload, 'Registration successful');
};

export const refreshToken = async (refreshTokenValue: string) =>
  apiRequest<{ token: string }>('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

export const logout = async () =>
  apiRequest<void>('/auth/logout', {
    method: 'POST',
  });

export const getProfile = async (): Promise<AuthUser> => {
  const data = await apiRequest<Record<string, unknown>>('/auth/me');
  return {
    id: typeof data.id === 'string' ? data.id : '',
    email: typeof data.email === 'string' ? data.email : '',
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    role: typeof data.role === 'string' ? data.role : '',
    avatar: data.avatar === null || typeof data.avatar === 'string' ? (data.avatar as string | null) : null,
  };
};
