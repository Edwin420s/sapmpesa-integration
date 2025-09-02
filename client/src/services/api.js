import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// M-Pesa API
export const mpesaAPI = {
  stkPush: (data) => api.post('/mpesa/stk-push', data),
  b2cPayment: (data) => api.post('/mpesa/b2c', data),
  getTransactionStatus: (checkoutRequestId) => 
    api.get(`/mpesa/transaction-status/${checkoutRequestId}`),
  queryTransaction: (data) => api.post('/mpesa/query-transaction', data),
};

// Transactions API
export const transactionsAPI = {
  getTransactions: (params = '') => api.get(`/transactions?${params}`),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  getTransactionByCheckoutId: (checkoutRequestId) =>
    api.get(`/transactions/by-checkout/${checkoutRequestId}`),
  getStats: (params = '') => api.get(`/transactions/stats?${params}`),
  getReconciliation: (date) => 
    api.get(`/transactions/reconciliation?date=${date}`),
  retrySapSync: (id) => api.post(`/transactions/${id}/retry-sap`),
  exportTransactions: (params = '') =>
    api.get(`/transactions/export?${params}`, { responseType: 'blob' }),
};

// SAP API
export const sapAPI = {
  syncTransaction: (data) => api.post('/sap/sync-transaction', data),
  getDocument: (documentId) => api.get(`/sap/document/${documentId}`),
  queryTransactions: (params = '') => api.get(`/sap/transactions?${params}`),
  getHealth: () => api.get('/sap/health'),
};

// Notifications API
export const notificationsAPI = {
  createNotification: (data) => api.post('/notifications', data),
  getNotifications: (params = '') => api.get(`/notifications?${params}`),
  getNotification: (id) => api.get(`/notifications/${id}`),
  retryNotification: (id) => api.post(`/notifications/${id}/retry`),
  getStats: (params = '') => api.get(`/notifications/stats?${params}`),
  sendBulkNotifications: (data) => api.post('/notifications/bulk', data),
};

// Dashboard API
export const dashboardAPI = {
  getDashboardStats: (params = '') => api.get(`/dashboard/stats?${params}`),
  getRecentTransactions: (limit = 10) =>
    api.get(`/dashboard/recent-transactions?limit=${limit}`),
  getActivityFeed: (limit = 20) =>
    api.get(`/dashboard/activity?limit=${limit}`),
};

// Health API
export const healthAPI = {
  getHealth: () => api.get('/health'),
  getDetailedHealth: () => api.get('/health/detailed'),
  getHealthHistory: (serviceName, hours = 24) =>
    api.get(`/health/history/${serviceName}?hours=${hours}`),
};

// Direct exports for convenience
export const initiatePayment = mpesaAPI.stkPush;
export const getDashboardStats = dashboardAPI.getDashboardStats;
export const getRecentTransactions = dashboardAPI.getRecentTransactions;
export const getReconciliation = transactionsAPI.getReconciliation;
export const getReports = transactionsAPI.getStats; // Assuming getReports is getStats
export const getProfile = authAPI.getProfile;
export const updateProfile = authAPI.changePassword; // Assuming updateProfile is changePassword
export const updateSettings = authAPI.changePassword; // Assuming updateSettings is changePassword
export const getTransactions = transactionsAPI.getTransactions;

// Export all API methods
export default {
  auth: authAPI,
  mpesa: mpesaAPI,
  transactions: transactionsAPI,
  sap: sapAPI,
  notifications: notificationsAPI,
  dashboard: dashboardAPI,
  health: healthAPI,
};
