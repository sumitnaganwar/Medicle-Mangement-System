import api from './api';

export const dashboardService = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  getDailySalesReport: (date) => api.get(`/reports/daily?date=${date}`),
  getMonthlyReport: (year, month) => api.get(`/reports/monthly?year=${year}&month=${month}`)
};