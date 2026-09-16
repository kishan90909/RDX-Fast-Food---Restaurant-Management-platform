const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `API request failed (${response.status})`)
  return data
}

const encode = (value) => encodeURIComponent(String(value || ''))

export const api = {
  auth: {
    register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    requestOtp: (email) => request('/auth/otp/request', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOtp: (email, otp) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ email, otp }) }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  health: () => request('/health'),
  menu: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value) })
    return request(`/menu${query.toString() ? `?${query}` : ''}`)
  },
  menuAdmin: {
    list: () => request('/menu/admin'),
    create: (payload) => request('/menu/admin', { method: 'POST', body: JSON.stringify(payload) }),
    update: (itemId, payload) => request(`/menu/admin/${encode(itemId)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: (itemId) => request(`/menu/admin/${encode(itemId)}`, { method: 'DELETE' }),
    removeCategory: (category) => request(`/menu/admin/category/${encode(category)}`, { method: 'DELETE' }),
  },
  favorites: {
    get: (customerKey) => request(`/favorites/${encode(customerKey)}`),
    add: (customerKey, itemId) => request('/favorites', { method: 'POST', body: JSON.stringify({ customerKey, itemId }) }),
    remove: (customerKey, itemId) => request(`/favorites/${encode(customerKey)}/${encode(itemId)}`, { method: 'DELETE' }),
  },
  cart: {
    get: (customerKey) => request(`/cart/${encode(customerKey)}`),
    replace: (customerKey, items) => request('/cart', { method: 'PUT', body: JSON.stringify({ customerKey, items }) }),
    clear: (customerKey) => request(`/cart/${encode(customerKey)}`, { method: 'DELETE' }),
  },
  offers: {
    list: () => request('/offers'),
    validate: (code, subtotal) => request('/offers/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  },
  coupons: {
    list: () => request('/coupons'),
    validate: (code, subtotal) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  },
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${encode(id)}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    clear: () => request('/notifications', { method: 'DELETE' }),
  },
  kitchen: {
    list: () => request('/kitchen/orders'),
    updateStatus: (orderId, status) => request(`/kitchen/orders/${encode(orderId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  analytics: {
    get: (period = '30') => request(`/analytics?period=${encode(period)}`),
  },
  inventory: {
    list: () => request('/inventory'),
    update: (itemId, payload) => request(`/inventory/${encode(itemId)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    adjust: (itemId, amount) => request(`/inventory/${encode(itemId)}/adjust`, { method: 'POST', body: JSON.stringify({ amount }) }),
  },

  loyalty: {
    get: () => request('/loyalty'),
  },
  recommendations: {
    get: () => request('/recommendations'),
  },
  personalizedMenu: {
    get: () => request('/personalized-menu'),
  },
  invoices: {
    download: async (orderId) => {
      const response = await fetch(`${API_BASE_URL}/invoices/${encode(orderId)}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Invoice download failed (${response.status})`)
      }
      return response.blob()
    },
  },
  reviews: {
    list: () => request('/reviews'),
    save: (orderId, payload) => request(`/reviews/${encode(orderId)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  },
  orders: {
    list: (customerKey) => request(`/orders/${encode(customerKey || 'me')}`),
    get: (customerKey, orderId) => request(`/orders/${encode(customerKey || 'me')}/${encode(orderId)}`),
    reorder: (customerKey, orderId) => request(`/orders/${encode(customerKey || 'me')}/${encode(orderId)}/reorder`, { method: 'POST' }),
    create: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
    adminList: () => request('/orders/admin/all'),
    adminGet: (orderId) => request(`/orders/admin/${encode(orderId)}`),
    adminUpdatePaymentStatus: (orderId, paymentStatus) => request(`/orders/admin/${encode(orderId)}/payment-status`, { method: 'PATCH', body: JSON.stringify({ paymentStatus }) }),
    adminUpdateStatus: (orderId, status) => request(`/orders/admin/${encode(orderId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
}

export const getCustomerKey = (user) => user?.email ? `email:${user.email.trim().toLowerCase()}` : ''
export const apiUrl = API_BASE_URL
