import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;