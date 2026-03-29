/** Doluysa o adres; boşsa prod’da relative (/api). Dev’de boş → Vite proxy (varsayılan hedef :5118). */
function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return '';
}

const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = 'posdemo_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message = data?.message ?? `HTTP ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data;
}

export const api = {
  baseUrl: API_BASE_URL,

  login: (body) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  registerCustomer: (body) =>
    request('/api/auth/register-customer', { method: 'POST', body: JSON.stringify(body) }),
  registerBusiness: (body) =>
    request('/api/auth/register-business', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),

  adminOverview: () => request('/api/admin/overview'),
  adminUsers: (activeOnly) =>
    request(`/api/admin/users${activeOnly ? '?activeOnly=true' : ''}`),
  adminUser: (id) => request(`/api/admin/users/${id}`),
  adminCreateUser: (body) =>
    request('/api/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateUser: (id, body) =>
    request(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteUser: (id) =>
    request(`/api/admin/users/${id}`, { method: 'DELETE' }),

  adminBusinesses: () => request('/api/admin/businesses'),
  adminBusiness: (id) => request(`/api/admin/businesses/${id}`),
  adminCreateBusiness: (body) =>
    request('/api/admin/businesses', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateBusiness: (id, body) =>
    request(`/api/admin/businesses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteBusiness: (id) =>
    request(`/api/admin/businesses/${id}`, { method: 'DELETE' }),

  adminOrders: () => request('/api/admin/orders'),

  catalogBusinesses: () => request('/api/catalog/businesses'),
  catalogProducts: (businessId) =>
    request(`/api/catalog/businesses/${businessId}/products`),

  businessProducts: () => request('/api/business/products'),
  businessCreateProduct: (body) =>
    request('/api/business/products', { method: 'POST', body: JSON.stringify(body) }),
  businessUpdateProduct: (id, body) =>
    request(`/api/business/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  businessDeleteProduct: (id) =>
    request(`/api/business/products/${id}`, { method: 'DELETE' }),

  businessOrders: () => request('/api/business/orders'),

  customerOrders: () => request('/api/customer/orders'),
  customerCreateOrder: (body) =>
    request('/api/customer/orders', { method: 'POST', body: JSON.stringify(body) }),
  customerCancelOrder: (id, body) =>
    request(`/api/customer/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    }),

  chatThreads: () => request('/api/chat/threads'),
  chatMessages: (businessId, customerUserId) => {
    const q = customerUserId
      ? `?businessId=${businessId}&customerUserId=${customerUserId}`
      : `?businessId=${businessId}`;
    return request(`/api/chat/messages${q}`);
  },
  chatSend: (body) =>
    request('/api/chat/messages', { method: 'POST', body: JSON.stringify(body) }),
};
