import { getSession, signOut } from 'next-auth/react';

const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://nestmart-sy4h.onrender.com'
  : 'http://localhost:5000';
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
const API_URL = RAW_API_URL.replace(/\/+$/, '');
const API_HOST = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

function buildApiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  
  // Strip any leading /api or api from the path to prevent double-prefixing
  let cleanPath = path;
  if (cleanPath.startsWith('/api/')) cleanPath = cleanPath.slice(4);
  else if (cleanPath.startsWith('api/')) cleanPath = cleanPath.slice(3);
  else if (cleanPath === '/api' || cleanPath === 'api') cleanPath = '/';
  
  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${API_HOST}/api${normalized}`;
}

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

      const res = await fetch(buildApiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
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
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include'
  };

  const url = buildApiUrl(path);
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    console.error(`API Fetch Network Error [${url}]:`, err);
    // During build time on Render/Vercel, we don't want to crash the prerendering if the backend is unreachable for GET requests.
    // However, for POST/PUT/DELETE or at runtime, we should still throw so the logic handles it correctly.
    if (typeof window === 'undefined' && 
        process.env.NODE_ENV === 'production' && 
        (!options.method || options.method.toUpperCase() === 'GET')) {
      // Return a safe empty structure for paginated results or objects
      return { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } } as unknown as T;
    }
    throw new ApiFetchError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: `Failed to connect to backend at ${url}. Ensure the server is running.`,
    });
  }

  if (res.status === 401 && !skipRefresh && typeof window !== 'undefined') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (init.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      res = await fetch(url, init);
    }
    if (res.status === 401) {
      // Clear backend cookies first
      try {
        await fetch(buildApiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
      } catch (e) {
        console.warn('Failed to call backend logout during 401', e);
      }
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
  role: 'customer' | 'manager' | 'admin' | 'support';
  emailVerified: boolean;
  avatarUrl: string | null;
  phone: string | null;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
  primaryAddress1Id?: string | null;
  primaryAddress2Id?: string | null;
}

export interface Address {
  id: string;
  label?: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressBookResponse {
  items: Address[];
  primaryAddress1Id: string | null;
  primaryAddress2Id: string | null;
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

export interface GoogleLoginProfile {
  sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean | null;
  intent?: 'login' | 'register';
}

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiFetch<RegisterResponse>('/api/auth/register', { method: 'POST', body: input }),
  login: (input: { email: string; password: string }) =>
    apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: input }),
  googleLogin: (input: { idToken?: string; profile?: GoogleLoginProfile; intent?: 'login' | 'register' }) =>
    apiFetch<LoginResponse>('/api/auth/google', { method: 'POST', body: input }),
  verifyOtp: (input: { email: string; otp: string }) =>
    apiFetch<{ verified: boolean }>('/api/auth/verify-otp', { method: 'POST', body: input }),
  resendOtp: (input: { email: string }) =>
    apiFetch<{ ok: boolean }>('/api/auth/resend-otp', { method: 'POST', body: input }),
  forgotPassword: (input: { email: string }) =>
    apiFetch<{ ok: boolean }>('/api/auth/forgot-password', { method: 'POST', body: input }),
  resetPassword: (input: { token: string; password: string }) =>
    apiFetch<{ ok: boolean }>('/api/auth/reset-password', { method: 'POST', body: input })
};

export interface WishlistProductBackend {
  _id: string;
  slug: string;
  title: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
}

export const usersApi = {
  me: () => apiFetch<UserProfile>('/api/users/me'),
  updateProfile: (input: { name?: string; phone?: string; avatarUrl?: string }) =>
    apiFetch<UserProfile>('/api/users/me', { method: 'PATCH', body: input }),
  addresses: () => apiFetch<AddressBookResponse>('/api/users/me/addresses'),
  createAddress: (input: Omit<Address, 'id'>) =>
    apiFetch<Address>('/api/users/me/addresses', { method: 'POST', body: input }),
  updateAddress: (id: string, input: Partial<Omit<Address, 'id'>>) =>
    apiFetch<Address>(`/api/users/me/addresses/${id}`, { method: 'PATCH', body: input }),
  deleteAddress: (id: string) =>
    apiFetch<{ ok: boolean }>(`/api/users/me/addresses/${id}`, { method: 'DELETE' }),
  setPrimaryAddresses: (input: { primaryAddress1Id?: string | null; primaryAddress2Id?: string | null }) =>
    apiFetch<{ primaryAddress1Id: string | null; primaryAddress2Id: string | null }>(
      '/api/users/me/addresses/primary',
      { method: 'POST', body: input }
    ),
  wishlist: () => apiFetch<{ items: WishlistProductBackend[] }>('/api/users/me/wishlist'),
  addToWishlist: (productId: string) =>
    apiFetch<{ ok: boolean }>('/api/users/me/wishlist', { method: 'POST', body: { productId } }),
  removeFromWishlist: (productId: string) =>
    apiFetch<{ ok: boolean }>(`/api/users/me/wishlist/${productId}`, { method: 'DELETE' })
};

export interface ProductSummary {
  _id: string;
  slug: string;
  title: string;
  brand: string;
  category?: string | { _id: string; name: string };
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  ratingAverage: number;
  ratingCount: number;
  stock: number;
  isFeatured?: boolean;
  features?: string[];
  variants?: Array<{
    id: string;
    name: string;
    color?: string;
    colorHex?: string;
    size?: string;
    sku?: string;
    stock?: number;
    price: number;
  }>;
  attributes?: Record<string, any>;
  tags?: string[];
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ProductListParams {
  q?: string;
  category?: string;
  brand?: string;
  tag?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  list: (params: ProductListParams = {}, options: RequestOptions = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<Paginated<ProductSummary>>(`/api/products${suffix}`, options);
  },
  get: (id: string, options: RequestOptions = {}) => apiFetch<ProductSummary>(`/api/products/${id}`, options),
  related: (id: string, options: RequestOptions = {}) =>
    apiFetch<{ items: ProductSummary[] }>(`/api/products/${id}/related`, options)
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
  role: 'customer' | 'manager' | 'admin' | 'support';
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

export interface CartItem {
  productId: string;
  title: string;
  image?: string;
  unitPrice: number;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  discount: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  coupon: AppliedCoupon | null;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  couponCode: string | null;
  currency: string;
}

export const cartApi = {
  get: () => apiFetch<{ cart: Cart; totals: CartTotals }>('/api/cart'),
  totals: () => apiFetch<{ totals: CartTotals }>('/api/cart/totals'),
  addItem: (productId: string, quantity = 1) =>
    apiFetch<{ cart: Cart; totals: CartTotals }>('/api/cart/items', { method: 'POST', body: { productId, quantity } }),
  updateItem: (productId: string, quantity: number) =>
    apiFetch<{ cart: Cart; totals: CartTotals }>(`/api/cart/items/${productId}`, { method: 'PATCH', body: { quantity } }),
  removeItem: (productId: string) =>
    apiFetch<{ cart: Cart; totals: CartTotals }>(`/api/cart/items/${productId}`, { method: 'DELETE' }),
  applyCoupon: (code: string) =>
    apiFetch<{ cart: Cart; totals: CartTotals }>('/api/cart/coupon', { method: 'POST', body: { code } }),
  removeCoupon: () =>
    apiFetch<{ cart: Cart; totals: CartTotals }>('/api/cart/coupon', { method: 'DELETE' })
};

export interface CategoryTreeItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  count?: number;
  children: CategoryTreeItem[];
}

export const categoriesApi = {
  tree: (options: RequestOptions = {}) => apiFetch<{ items: CategoryTreeItem[] }>('/api/categories', options),
  get: (id: string, options: RequestOptions = {}) => apiFetch<CategoryTreeItem>(`/api/categories/${id}`, options),
  create: (input: { name: string; slug: string; parentId?: string | null; description?: string }) =>
    apiFetch<CategoryTreeItem>('/api/categories', { method: 'POST', body: input }),
  update: (id: string, input: { name?: string; slug?: string; parentId?: string | null; description?: string }) =>
    apiFetch<CategoryTreeItem>(`/api/categories/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => apiFetch<{ ok: boolean }>(`/api/categories/${id}`, { method: 'DELETE' })
};

export interface OrderLine {
  productId: string;
  title: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  couponCode?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  placedAt: string;
  createdAt?: string;
}

export const ordersApi = {
  create: (input: {
    paymentMethod: 'cod' | 'card';
    shippingAddressId?: string;
    shippingAddress?: Order['shippingAddress'];
  }) => apiFetch<Order>('/api/orders', { method: 'POST', body: input }),
  listMine: (page = 1, limit = 20, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) qs.set('status', status);
    return apiFetch<Paginated<Order>>(`/api/orders?${qs.toString()}`);
  },
  get: (id: string) => apiFetch<Order>(`/api/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    apiFetch<Order>(`/api/orders/${id}/cancel`, { method: 'PATCH', body: { reason } }),
  returnRequest: (id: string, reason: string) =>
    apiFetch<Order>(`/api/orders/${id}/return`, { method: 'PATCH', body: { reason } }),
  verifyRazorpay: (id: string, input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    apiFetch<Order>(`/api/orders/${id}/verify-razorpay`, { method: 'POST', body: input })
};

export interface AdminOrderUpdate {
  status: string;
  trackingNumber?: string;
}

export const adminOrdersApi = {
  list: (page = 1, limit = 20, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) qs.set('status', status);
    return apiFetch<Paginated<Order>>(`/api/orders/admin?${qs.toString()}`);
  },
  updateStatus: (id: string, input: AdminOrderUpdate) =>
    apiFetch<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: input })
};

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderatorNote?: string;
  createdAt: string;
}

export const reviewsApi = {
  list: (params: { productId?: string; page?: number; limit?: number; status?: 'approved' } = {}, options: RequestOptions = {}) => {
    const qs = new URLSearchParams();
    if (params.productId) qs.set('productId', params.productId);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<Paginated<Review>>(`/api/reviews${suffix}`, options);
  },
  listPending: (page = 1, limit = 20) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch<Paginated<Review>>(`/api/reviews/pending?${qs.toString()}`);
  },
  mine: (params: { productId?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.productId) qs.set('productId', params.productId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<{ items: Review[] }>(`/api/reviews/mine${suffix}`);
  },
  create: (input: { productId: string; rating: number; title?: string; body: string }) =>
    apiFetch<Review>('/api/reviews', { method: 'POST', body: input }),
  update: (id: string, input: { rating: number; title?: string; body: string }) =>
    apiFetch<Review>(`/api/reviews/${id}`, { method: 'PUT', body: input }),
  moderate: (id: string, input: { status: 'approved' | 'rejected'; moderatorNote?: string }) =>
    apiFetch<Review>(`/api/reviews/${id}/moderate`, { method: 'PUT', body: input }),
  remove: (id: string) =>
    apiFetch<{ ok: boolean }>(`/api/reviews/${id}`, { method: 'DELETE' })
};

export const settingsApi = {
  get: () => apiFetch<Record<string, string>>('/api/settings'),
  update: (updates: Record<string, string>) =>
    apiFetch<{ ok: boolean }>('/api/settings', { method: 'PATCH', body: updates })
};

export interface CouponType {
  _id: string;
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt: string;
  createdAt: string;
}

export const couponsApi = {
  list: () => apiFetch<Paginated<CouponType>>('/api/coupons'),
  get: (id: string) => apiFetch<CouponType>(`/api/coupons/${id}`),
  create: (input: Record<string, unknown>) =>
    apiFetch<CouponType>('/api/coupons', { method: 'POST', body: input }),
  update: (id: string, input: Record<string, unknown>) =>
    apiFetch<CouponType>(`/api/coupons/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) =>
    apiFetch<{ ok: boolean }>(`/api/coupons/${id}`, { method: 'DELETE' }),
  validate: (code: string, cartTotal: number) =>
    apiFetch<AppliedCoupon>('/api/coupons/validate', { method: 'POST', body: { code, cartTotal } })
};

export interface AdminProductInput {
  slug?: string;
  title?: string;
  description?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  images?: string[];
  features?: string[];
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  stock?: number;
  sku?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    color?: string;
    colorHex?: string;
    size?: string;
    sku?: string;
  }>;
  attributes?: Record<string, unknown>;
}

export interface AdminProduct {
  _id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  compareAtPrice?: number;
  isFeatured?: boolean;
}

export const adminProductsApi = {
  list: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<Paginated<AdminProduct>>(`/api/products${suffix}`);
  },
  create: (input: AdminProductInput) => apiFetch<ProductSummary>('/api/products', { method: 'POST', body: input }),
  update: (id: string, input: AdminProductInput) =>
    apiFetch<ProductSummary>(`/api/products/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => apiFetch<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' })
};

export const uploadsApi = {
  uploadProductImage: async (file: File) => {
    const session = await getSession();
    const token = (session as unknown as { accessToken?: string } | null)?.accessToken;
    if (!token) {
      throw new ApiFetchError({ status: 401, code: 'UNAUTHORIZED', message: 'You must be signed in to upload images.' });
    }

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(buildApiUrl('/api/uploads/products/image'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const text = await res.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const err = (payload as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
      throw new ApiFetchError({
        status: res.status,
        code: err?.code ?? 'UPLOAD_FAILED',
        message: err?.message ?? `Upload failed with ${res.status}`,
        details: err?.details
      });
    }

    return payload as { url: string; publicId: string };
  }
};
