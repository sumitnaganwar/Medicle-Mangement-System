import api from './api';

export const medicineService = {
  // Basic CRUD
  getAllMedicines: () => api.get('/medicines'),
  getMedicineById: (id) => api.get(`/medicines/${id}`),
  createMedicine: (medicine) => api.post('/medicines', medicine),
  updateMedicine: (id, medicine) => api.put(`/medicines/${id}`, medicine),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
  
  // Search and Filter
  searchMedicines: (name) => api.get(`/medicines/search?name=${name}`),
  getMedicinesByCategory: (category) => api.get(`/medicines/category/${category}`),
  getLowStockMedicines: () => api.get('/medicines/low-stock'),
  // Zero stock only (backend should return items where stock == 0)
  getZeroStockMedicines: () => api.get('/medicines/zero-stock'),
  
  // Additional features
  getExpiredMedicines: () => api.get('/medicines/expired'),
  getNearExpiryMedicines: (days = 30) => api.get(`/medicines/near-expiry?days=${days}`)
};