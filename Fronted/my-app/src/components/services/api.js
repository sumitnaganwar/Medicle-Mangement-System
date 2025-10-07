import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set the correct boundary for FormData uploads
  if (config.data instanceof FormData) {
    if (config.headers && config.headers['Content-Type']) delete config.headers['Content-Type'];
    if (config.headers && config.headers['content-type']) delete config.headers['content-type'];
  } else {
    // For JSON requests, ensure the header is correct
    config.headers = config.headers || {};
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }
  return config;
});

// Extract token from login/register responses automatically if backend returns it
api.interceptors.response.use(
  (response) => {
    const token = response?.data?.token;
    const user = response?.data?.user;
    if (token) localStorage.setItem('auth_token', token);
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // Clear auth but don't hard-redirect; let UI handle re-auth gracefully
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } catch {}
    }
    return Promise.reject(error);
  }
);

export const medicineService = {
  getAllMedicines: () => api.get('/medicines'),
  getMedicineById: (id) => api.get(`/medicines/${id}`),
  createMedicine: (medicine) => api.post('/medicines', medicine),
  updateMedicine: (id, medicine) => api.put(`/medicines/${id}`, medicine),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
  searchMedicines: (name) => api.get(`/medicines/search?name=${name}`),
  getMedicinesByCategory: (category) => api.get(`/medicines/category/${category}`),
  getLowStockMedicines: () => api.get('/medicines/low-stock'),
};

export const saleService = {
  getAllSales: () => api.get('/sales'),
  getSaleById: (id) => api.get(`/sales/${id}`),
  createSale: (saleData) => api.post('/sales', saleData),
  sendReceipt: (saleId, email) => api.post(`/sales/${saleId}/send-receipt?email=${encodeURIComponent(email)}`),
  getTodaySales: () => api.get('/sales/today'),
  getTodayTotalSales: () => api.get('/sales/today/total'),
  deleteSale: (saleId) => api.delete(`/sales/${saleId}`),
  deleteSaleItem: (saleId, itemId) => api.delete(`/sales/${saleId}/items/${itemId}`),
};

export const customerService = {
  getAllCustomers: () => api.get('/customers'),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  createCustomer: (customer) => api.post('/customers', customer),
  updateCustomer: (id, customer) => api.put(`/customers/${id}`, customer),
  searchCustomers: (name) => api.get(`/customers/search?name=${name}`),
  getCustomerByPhone: (phone) => api.get(`/customers/phone/${phone}`),
  deleteCustomer: (id) => api.delete(`/customers/${id}`)
};

export const dashboardService = {
  getDashboardStats: () => api.get('/dashboard/stats'),
};

// User/Profile related APIs
export const userService = {
  // Fetch current user's profile
  getProfile: () => api.get('/users/me'),
  // Public profile by id (no auth required)
  getPublicProfile: (id) => api.get(`/users/public/${id}`),
  // Update profile details (name, email, phone, address, etc.)
  updateProfile: (profile) => api.put('/users/me', profile),
  // Upload or update avatar/photo
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Let axios set the correct multipart boundary header
    return api.post('/users/me/avatar', formData);
  },
};

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
  getToken: () => localStorage.getItem('auth_token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  },
  isAuthenticated: () => Boolean(localStorage.getItem('auth_token')),
};

export default api;