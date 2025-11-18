// API клиент для AI-интеграционного сервиса

import type {
  LoginRequest,
  LoginResponse,
  NeuralNetwork,
  NetworkCreateRequest,
  ClientApplication,
  ClientCreateRequest,
  RequestLog,
  UsageStats,
} from './types';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8091';

// Вспомогательная функция для работы с токеном
const getToken = (): string | null => {
  return localStorage.getItem('ai_admin_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('ai_admin_token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('ai_admin_token');
};

// Базовая функция для запросов
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers ?? undefined);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !endpoint.includes('/auth/')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  console.log(`🔍 [API] Отправляем ${options.method || 'GET'} запрос к ${endpoint}`);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(`📊 [API] Получен ответ: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      throw new Error('Не авторизован. Войдите снова.');
    }
    const errorText = await response.text();
    console.error(`❌ [API] Ошибка ${response.status}: ${errorText}`);
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  // Если ответ пустой (204 No Content)
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    console.log(`✅ [API] Успешный ответ без содержимого (${response.status})`);
    return {} as T;
  }

  const result = await response.json();
  console.log(`✅ [API] Успешный ответ с данными:`, result);
  return result;
}

// ==================== AUTH ====================

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetchApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  setToken(response.token);
  return response;
};

export const register = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return fetchApi<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// ==================== NETWORKS ====================

export const getNetworks = async (): Promise<NeuralNetwork[]> => {
  return fetchApi<NeuralNetwork[]>('/api/admin/networks');
};

export const getNetwork = async (id: string): Promise<NeuralNetwork> => {
  return fetchApi<NeuralNetwork>(`/api/admin/networks/${id}`);
};

export const createNetwork = async (data: NetworkCreateRequest): Promise<NeuralNetwork> => {
  return fetchApi<NeuralNetwork>('/api/admin/networks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateNetwork = async (id: string, data: NetworkCreateRequest): Promise<NeuralNetwork> => {
  return fetchApi<NeuralNetwork>(`/api/admin/networks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteNetwork = async (id: string): Promise<void> => {
  return fetchApi<void>(`/api/admin/networks/${id}`, {
    method: 'DELETE',
  });
};

// ==================== CLIENTS ====================

export const getClients = async (): Promise<ClientApplication[]> => {
  return fetchApi<ClientApplication[]>('/api/admin/clients');
};

export const getClient = async (id: string): Promise<ClientApplication> => {
  return fetchApi<ClientApplication>(`/api/admin/clients/${id}`);
};

export const createClient = async (data: ClientCreateRequest): Promise<ClientApplication> => {
  return fetchApi<ClientApplication>('/api/admin/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateClient = async (id: string, data: ClientCreateRequest): Promise<ClientApplication> => {
  return fetchApi<ClientApplication>(`/api/admin/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  return fetchApi<void>(`/api/admin/clients/${id}`, {
    method: 'DELETE',
  });
};

export const regenerateApiKey = async (id: string): Promise<ClientApplication> => {
  return fetchApi<ClientApplication>(`/api/admin/clients/${id}/regenerate-key`, {
    method: 'POST',
  });
};

// ==================== LOGS ====================

export const getLogs = async (
  page: number = 0,
  size: number = 50,
  filters?: {
    clientId?: string;
    networkId?: string;
    success?: boolean;
  }
): Promise<{ content: RequestLog[]; totalElements: number; totalPages: number }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.networkId) params.append('networkId', filters.networkId);
  if (filters?.success !== undefined) params.append('success', filters.success.toString());

  return fetchApi<{ content: RequestLog[]; totalElements: number; totalPages: number }>(
    `/api/admin/request-logs?${params.toString()}`
  );
};

// ==================== STATS ====================

export const getStats = async (): Promise<UsageStats> => {
  return fetchApi<UsageStats>('/api/admin/stats');
};

// ==================== USER AUTH & CABINET ====================

export const userLogin = async (payload: { email: string; password: string }) => {
  const res = await fetchApi<{ token: string; email: string }>('/api/user/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  localStorage.setItem('user_token', res.token);
  return res;
};

export const userRegister = async (payload: { fullName: string; email: string; password: string; repeatPassword: string }) => {
  const res = await fetchApi<{ token: string; email: string }>('/api/user/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  localStorage.setItem('user_token', res.token);
  return res;
};

export const userLogout = () => {
  localStorage.removeItem('user_token');
};

export const oauthAuthorizeUrl = (provider: 'google' | 'yandex') => `${API_BASE}/api/user/auth/oauth2/authorize/${provider}`;

// все запросы кабинета отправляем с user_token
async function userFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8091';
  const token = localStorage.getItem('user_token');
  const headers = new Headers(options.headers ?? undefined);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const resp = await fetch(`${base}${endpoint}`, { ...options, headers });
  if (!resp.ok) {
    const text = await resp.text();
    const error = new Error(text || `HTTP ${resp.status}`);
    (error as any).status = resp.status;
    throw error;
  }
  if (resp.status === 204) return {} as T;
  return resp.json();
}

export const getMyClients = () => userFetch<any[]>('/api/user/clients');
export const createMyClient = (payload: { name: string; description: string }) =>
  userFetch<any>('/api/user/clients', { method: 'POST', body: JSON.stringify(payload) });
export const updateMyClient = (id: string, payload: { name: string; description: string; isActive: boolean }) =>
  userFetch<any>(`/api/user/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteMyClient = (id: string) => userFetch<void>(`/api/user/clients/${id}`, { method: 'DELETE' });
export const regenerateMyApiKey = (id: string) => userFetch<any>(`/api/user/clients/${id}/regenerate-key`, { method: 'POST' });

export const getAvailableNetworks = () => userFetch<any[]>('/api/user/networks/available');
export const setClientNetworks = (clientId: string, networkIds: string[]) =>
  userFetch<void>(`/api/user/clients/${clientId}/networks`, { method: 'PUT', body: JSON.stringify({ networkIds }) });

export const getNetworkStats = (clientId: string) => userFetch<any[]>(`/api/user/clients/${clientId}/networks/stats`);

// ==================== SUBSCRIPTIONS ====================

export const getSubscriptionPlans = () => userFetch<any[]>('/api/user/subscriptions/plans');
export const getCurrentSubscription = () => userFetch<any>('/api/user/subscriptions/current');
export const createSubscription = (payload: { planName: string; paymentMethod: string }) =>
  userFetch<any>('/api/user/subscriptions/create', { method: 'POST', body: JSON.stringify(payload) });
export const cancelSubscription = (reason?: string) =>
  userFetch<any>('/api/user/subscriptions/cancel', { method: 'POST', body: JSON.stringify({ reason: reason || 'Отменено пользователем' }) });
export const getPaymentHistory = () => userFetch<any[]>('/api/user/subscriptions/payments/history');
export const getPaymentStatus = (transactionId: string) => userFetch<any>(`/api/user/subscriptions/payment/${transactionId}/status`);

