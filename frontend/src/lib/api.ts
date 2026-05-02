import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiFetchError extends Error implements ApiError {
  status: number;
  code: string;
  details?: unknown;
  constructor(error: ApiError) {
    super(error.message);
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
    this.name = 'ApiFetchError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Override the bearer token (server-side renders pass it explicitly). */
  token?: string;
  /** Don't try to refresh on 401. Used by the refresh call itself. */
  skipRefresh?: boolean;
}

interface RefreshState {
  inflight: Promise<string | null> | null;
}
const refreshState: RefreshState = { inflight: null };

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (refreshState.inflight) return refreshState.inflight;

  refreshState.inflight = (async () => {
    try {
      const session = await getSession();
      const refreshToken = (session as unknown as { refreshToken?: string })?.refreshToken;
      if (!refreshToken) return null;

      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken?: string };
      return data.accessToken ?? null;
    } finally {
      refreshState.inflight = null;
    }
  })();

  return refreshState.inflight;
}

async function getBearerToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const session = (await getSession()) as unknown as { accessToken?: string } | null;
  return session?.accessToken ?? null;
}

/** Typed fetch wrapper. Auto-injects bearer token, handles 401 with one refresh-and-retry, and signs out on second failure. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, skipRefresh, headers, ...rest } = options;

  const bearer = token ?? (await getBearerToken());
  const init: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...(headers as Record<string, string> | undefined)
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  };

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  let res = await fetch(url, init);

  if (res.status === 401 && !skipRefresh && typeof window !== 'undefined') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (init.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      res = await fetch(url, init);
    }
    if (res.status === 401) {
      await signOut({ callbackUrl: '/auth/login' });
      throw new ApiFetchError({ status: 401, code: 'UNAUTHORIZED', message: 'Session expired' });
    }
  }

  const text = await res.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = (payload as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiFetchError({
      status: res.status,
      code: err?.code ?? 'UNKNOWN',
      message: err?.message ?? `Request failed with ${res.status}`,
      details: err?.details
    });
  }
  return payload as T;
}

// ---------------------- Typed convenience helpers ----------------------

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'customer' | 'manager' | 'admin';
  emailVerified: boolean;
  avatarUrl: string | null;
  phone: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: AuthUser;
  otpSent: boolean;
}

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiFetch<RegisterResponse>('/api/auth/register', { method: 'POST', body: input }),
  verifyOtp: (input: { email: string; otp: string }) =>
    apiFetch<{ verified: boolean }>('/api/auth/verify-otp', { method: 'POST', body: input }),
  forgotPassword: (input: { email: string }) =>
    apiFetch<{ ok: boolean }>('/api/auth/forgot-password', { method: 'POST', body: input }),
  resetPassword: (input: { token: string; password: string }) =>
    apiFetch<{ ok: boolean }>('/api/auth/reset-password', { method: 'POST', body: input })
};

export interface ProductSummary {
  _id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  ratingAverage: number;
  ratingCount: number;
  stock: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const productsApi = {
  list: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<Paginated<ProductSummary>>(`/api/products${suffix}`);
  },
  get: (id: string) => apiFetch<ProductSummary>(`/api/products/${id}`),
  related: (id: string) => apiFetch<{ items: ProductSummary[] }>(`/api/products/${id}/related`)
};

export interface AdminDashboardStats {
  range: { days: number; from: string; to: string };
  revenue: number;
  ordersCount: number;
  usersCount: number;
  newUsersCount: number;
  conversion: number;
  avgOrderValue: number;
  byStatus: Array<{ status: string; count: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
}

export interface AdminInventoryAlert {
  _id: string;
  slug: string;
  title: string;
  stock: number;
  price: number;
  images: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'customer' | 'manager' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export const adminApi = {
  stats: (days = 30) => apiFetch<AdminDashboardStats>(`/api/admin/stats?days=${days}`),
  inventoryAlerts: (threshold = 10) =>
    apiFetch<{ threshold: number; items: AdminInventoryAlert[] }>(`/api/admin/inventory-alerts?threshold=${threshold}`),
  users: (page = 1, limit = 10) => apiFetch<Paginated<AdminUser>>(`/api/admin/users?page=${page}&limit=${limit}`),
  bulkUpdateProducts: (input: { productIds: string[]; update: Record<string, unknown> }) =>
    apiFetch<{ matched: number; modified: number }>('/api/admin/products/bulk', { method: 'POST', body: input }),
  bulkUpdateOrderStatus: (input: { orderIds: string[]; status: string }) =>
    apiFetch<{ matched: number; modified: number }>('/api/admin/orders/bulk-status', { method: 'POST', body: input })
};
