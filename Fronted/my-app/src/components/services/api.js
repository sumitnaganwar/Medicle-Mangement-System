import axios from 'axios';

const API_BASE_URL = '/api';

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

// Notifications placeholders (extend with backend endpoints when available)
export const notificationService = {
  // Example: api.get('/notifications') in future
  sendExpiryAlert: (payload) => Promise.resolve({ data: { ok: true, payload } }),
  sendDailySummary: (payload) => Promise.resolve({ data: { ok: true, payload } }),
  notifySupplierDelay: (payload) => Promise.resolve({ data: { ok: true, payload } })
};

// Supplier service with localStorage fallback
const SUPPLIER_PROFILE_KEY = 'supplier_profile_v1';
function readSupplierProfile() {
  try { return JSON.parse(localStorage.getItem(SUPPLIER_PROFILE_KEY) || 'null'); } catch { return null; }
}
function writeSupplierProfile(profile) {
  safeSetItem(SUPPLIER_PROFILE_KEY, JSON.stringify(profile));
}

export const supplierService = {
  createSupplier: (payload) => api.post('/suppliers', payload),
  getMyProfile: async () => {
    try {
      // Try backend first
      return await api.get('/suppliers/me');
    } catch (error) {
      // Fallback to localStorage
      const profile = readSupplierProfile();
      if (profile) {
        return Promise.resolve({ data: profile });
      }
      // Return default profile if none exists (minimal data to avoid storage issues)
      const defaultProfile = {
        id: 'supplier-1',
        name: 'Supplier User',
        email: 'supplier@example.com',
        role: 'Supplier'
      };
      writeSupplierProfile(defaultProfile);
      return Promise.resolve({ data: defaultProfile });
    }
  },
  updateMyProfile: async (profileData) => {
    try {
      // Try backend first
      return await api.put('/suppliers/me', profileData);
    } catch (error) {
      // Fallback to localStorage
      const updatedProfile = { ...readSupplierProfile(), ...profileData };
      writeSupplierProfile(updatedProfile);
      return Promise.resolve({ data: updatedProfile });
    }
  },
  uploadPhoto: async (file) => {
    try {
      // Try backend first
      return await api.post('/suppliers/me/photo', file);
    } catch (error) {
      // Fallback to localStorage - convert file to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const profile = readSupplierProfile();
          const updatedProfile = { ...profile, photo: reader.result };
          writeSupplierProfile(updatedProfile);
          resolve({ data: updatedProfile });
        };
        reader.readAsDataURL(file);
      });
    }
  },
  listSuppliers: () => api.get('/suppliers'),
};

// User/Profile related APIs
export const userService = {
  // Fetch current user's profile with localStorage fallback
  getProfile: async () => {
    try {
      return await api.get('/users/me');
    } catch (error) {
      // Fallback: use minimal auth user and, if Supplier, enrich from supplier profile store
      const authUser = authService.getUser();
      let data = authUser || null;
      try {
        const supplier = readSupplierProfile();
        if (supplier && (authUser?.role === 'Supplier' || supplier?.role === 'Supplier')) {
          data = { ...supplier, ...authUser };
        }
      } catch {}
      if (data) {
        return Promise.resolve({ data });
      }
      return Promise.reject(error);
    }
  },
  // Public profile by id (no auth required)
  getPublicProfile: (id) => api.get(`/users/public/${id}`),
  // Fetch owner basic profile
  getOwner: () => api.get('/users/owner'),
  // List all owners
  listOwners: () => api.get('/users/owners'),
  // List all users with role Supplier
  listSupplierUsers: () => api.get('/users/suppliers'),
  // Update profile details (name, email, phone, address, etc.) with fallback
  updateProfile: async (profile) => {
    try {
      return await api.put('/users/me', profile);
    } catch (error) {
      // Fallback: update local storage and supplier local profile if present
      const current = authService.getUser() || {};
      const updatedUser = { ...current, ...profile };
      authService.setUser(updatedUser);
      const supplier = readSupplierProfile();
      if (supplier) {
        writeSupplierProfile({ ...supplier, ...profile });
      }
      return Promise.resolve({ data: updatedUser });
    }
  },
  // Upload or update avatar/photo with fallback
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await api.post('/users/me/avatar', formData);
    } catch (error) {
      // Fallback: convert to base64 and store locally
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result;
          const current = authService.getUser() || {};
          const updatedUser = { ...current, avatarUrl: url };
          authService.setUser(updatedUser);
          const supplier = readSupplierProfile();
          if (supplier) writeSupplierProfile({ ...supplier, photo: url });
          resolve({ data: { avatarUrl: url } });
        };
        reader.readAsDataURL(file);
      });
    }
  },
};

// Temporary purchase service using localStorage (replace with backend later)
const PURCHASE_KEY = 'purchase_orders_v1';
const PURCHASE_DELIVERIES_KEY = 'purchase_deliveries_v1';
const PURCHASE_BILLS_KEY = 'purchase_bills_v1';
function readPurchases() {
  try { return JSON.parse(localStorage.getItem(PURCHASE_KEY) || '[]'); } catch { return []; }
}
function writePurchases(list) {
  safeSetItem(PURCHASE_KEY, JSON.stringify(list));
}
function readDeliveries() {
  try { return JSON.parse(localStorage.getItem(PURCHASE_DELIVERIES_KEY) || '[]'); } catch { return []; }
}
function writeDeliveries(list) {
  safeSetItem(PURCHASE_DELIVERIES_KEY, JSON.stringify(list));
}
function readBills() {
  try { return JSON.parse(localStorage.getItem(PURCHASE_BILLS_KEY) || '[]'); } catch { return []; }
}
function writeBills(list) {
  safeSetItem(PURCHASE_BILLS_KEY, JSON.stringify(list));
}
export const purchaseService = {
  createOrder: (order) => {
    const list = readPurchases();
    const id = order.id || `PO-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const status = order.status || 'PENDING';
    const saved = { ...order, id, createdAt, status };
    list.push(saved);
    writePurchases(list);
    return Promise.resolve({ data: saved });
  },
  listOrders: () => Promise.resolve({ data: readPurchases() }),
  getOrderById: (id) => {
    const list = readPurchases();
    const order = list.find(o => String(o.id) === String(id));
    if (order) {
      return Promise.resolve({ data: order });
    }
    return Promise.reject(new Error('Order not found'));
  },
  updateOrderStatus: (id, status) => {
    const list = readPurchases();
    const idx = list.findIndex(o => String(o.id) === String(id));
    if (idx >= 0) {
      const updateData = { ...list[idx], status };
      
      // Add delivery timestamp when order is delivered
      if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date().toISOString();
      }
      
      list[idx] = updateData;
      writePurchases(list);
      return Promise.resolve({ data: list[idx] });
    }
    return Promise.reject(new Error('Order not found'));
  },
  getDeliveredOrders: () => {
    const list = readPurchases();
    const deliveredOrders = list.filter(order => order.status === 'DELIVERED');
    return Promise.resolve({ data: deliveredOrders });
  },
  getActiveOrders: () => {
    const list = readPurchases();
    const activeOrders = list.filter(order => order.status !== 'DELIVERED' && order.status !== 'REJECTED');
    return Promise.resolve({ data: activeOrders });
  },
  updateSupplierResponse: (id, response) => {
    const list = readPurchases();
    const idx = list.findIndex(o => String(o.id) === String(id));
    if (idx >= 0) {
      // Only allow ACCEPT/REJECT for PENDING orders
      if (list[idx].status === 'PENDING') {
        const status = response === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
        list[idx] = { ...list[idx], status, supplierResponse: response };
        writePurchases(list);
        return Promise.resolve({ data: list[idx] });
      } else {
        return Promise.reject(new Error(`Cannot ${response.toLowerCase()} order with status: ${list[idx].status}`));
      }
    }
    return Promise.reject(new Error('Order not found'));
  },
  processPayment: (paymentData) => {
    const list = readPurchases();
    const idx = list.findIndex(o => String(o.id) === String(paymentData.orderId));
    if (idx >= 0) {
      // Only update to PAID if order is currently ACCEPTED
      if (list[idx].status === 'ACCEPTED') {
        list[idx] = { ...list[idx], status: 'PAID', paymentData };
        writePurchases(list);
        return Promise.resolve({ data: list[idx] });
      } else {
        return Promise.reject(new Error(`Cannot process payment for order with status: ${list[idx].status}`));
      }
    }
    return Promise.reject(new Error('Order not found'));
  },
  clearAll: () => { writePurchases([]); writeDeliveries([]); return Promise.resolve({ data: true }); },

  // Deliveries tracking
  createDelivery: (order) => {
    const list = readDeliveries();
    const id = order.id || `DLV-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const stage = order.stage || 'CREATED';
    const saved = { ...order, id, createdAt, stage };
    list.push(saved);
    writeDeliveries(list);
    return Promise.resolve({ data: saved });
  },
  listDeliveries: () => Promise.resolve({ data: readDeliveries() }),
  updateDeliveryStage: (id, stage) => {
    const list = readDeliveries();
    const idx = list.findIndex(o => String(o.id) === String(id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], stage };
      writeDeliveries(list);
      return Promise.resolve({ data: list[idx] });
    }
    return Promise.reject(new Error('Delivery not found'));
  },
  updatePaymentStatus: (id, paymentStatus) => {
    const list = readDeliveries();
    const idx = list.findIndex(o => String(o.id) === String(id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], paymentStatus, stage: paymentStatus === 'PAID' ? 'PAID' : 'CONFIRMED' };
      writeDeliveries(list);
      return Promise.resolve({ data: list[idx] });
    }
    return Promise.reject(new Error('Delivery not found'));
  },
  updateDeliveryStatus: (id, deliveryStatus) => {
    const list = readDeliveries();
    const idx = list.findIndex(o => String(o.id) === String(id));
    if (idx >= 0) {
      const completedDate = deliveryStatus === 'DELIVERED' ? new Date().toISOString() : null;
      list[idx] = { ...list[idx], deliveryStatus, stage: deliveryStatus === 'DELIVERED' ? 'DELIVERED' : 'PAID', completedDate };
      writeDeliveries(list);
      return Promise.resolve({ data: list[idx] });
    }
    return Promise.reject(new Error('Delivery not found'));
  }
};

// Bills/Payments for suppliers
export const supplierPaymentService = {
  createBill: (bill) => {
    const list = readBills();
    const id = bill.id || `BILL-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const status = bill.status || 'PENDING';
    const saved = { ...bill, id, createdAt, status };
    list.push(saved);
    writeBills(list);
    return Promise.resolve({ data: saved });
  },
  listBills: () => Promise.resolve({ data: readBills() }),
  updateBillStatus: (id, status) => {
    const list = readBills();
    const idx = list.findIndex(b => String(b.id) === String(id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], status };
      writeBills(list);
      return Promise.resolve({ data: list[idx] });
    }
    return Promise.reject(new Error('Bill not found'));
  },
  getBillByOrderId: (orderId) => {
    const list = readBills();
    const bill = list.find(b => String(b.orderId) === String(orderId));
    return Promise.resolve({ data: bill || null });
  }
};

// Helper function to safely store data in localStorage
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old data...');
      // Clear old data and try again
      clearOldLocalStorageData();
      localStorage.setItem(key, value);
    } else {
      throw error;
    }
  }
};

// Function to clear old localStorage data to free up space
const clearOldLocalStorageData = () => {
  // Keep only essential auth data, clear everything else
  const authToken = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');
  
  localStorage.clear();
  
  // Restore essential auth data
  if (authToken) localStorage.setItem('auth_token', authToken);
  if (authUser) localStorage.setItem('auth_user', authUser);
  
  console.log('Cleared old localStorage data to free up space');
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
  // Safe storage methods
  setToken: (token) => safeSetItem('auth_token', token),
  setUser: (user) => safeSetItem('auth_user', JSON.stringify(user)),
  // Utility methods
  clearStorage: () => {
    localStorage.clear();
    console.log('localStorage cleared');
  },
  getStorageSize: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },
};

export default api;