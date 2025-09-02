// Application constants
export const APP_NAME = 'SAP M-Pesa Integration';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'Your Company Name';
export const SUPPORT_EMAIL = 'support@company.com';
export const SUPPORT_PHONE = '+254 700 000 000';

// API Constants
export const API_TIMEOUT = 30000;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Transaction Constants
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

export const TRANSACTION_TYPES = {
  STK_PUSH: 'STK_PUSH',
  B2C: 'B2C',
  C2B: 'C2B',
  B2B: 'B2B',
  REVERSAL: 'REVERSAL'
};

export const TRANSACTION_STATUS_COLORS = {
  PENDING: '#f57c00',
  SUCCESS: '#2e7d32',
  FAILED: '#c62828',
  CANCELLED: '#757575'
};

export const TRANSACTION_STATUS_ICONS = {
  PENDING: '⏳',
  SUCCESS: '✅',
  FAILED: '❌',
  CANCELLED: '🚫'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
};

export const ROLE_PERMISSIONS = {
  admin: [
    'view_dashboard',
    'manage_users',
    'view_transactions',
    'initiate_payments',
    'view_reports',
    'manage_settings',
    'view_system_health',
    'export_data'
  ],
  user: [
    'view_dashboard',
    'view_transactions',
    'initiate_payments',
    'view_reports'
  ],
  viewer: [
    'view_dashboard',
    'view_transactions',
    'view_reports'
  ]
};

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy HH:mm',
  SHORT: 'MMM dd, yyyy',
  TIME: 'HH:mm:ss',
  INPUT: 'yyyy-MM-dd',
  INPUT_DATETIME: "yyyy-MM-dd'T'HH:mm"
};

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGE_SIZES: [10, 20, 50, 100]
};

// Validation Limits
export const VALIDATION_LIMITS = {
  PHONE_LENGTH: 12,
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 70000,
  ACCOUNT_REF_MIN: 1,
  ACCOUNT_REF_MAX: 12,
  TRANSACTION_DESC_MIN: 1,
  TRANSACTION_DESC_MAX: 13
};

// Currency
export const CURRENCY = {
  CODE: 'KES',
  SYMBOL: 'KSh',
  DECIMALS: 2
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SETTINGS: 'app_settings',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  SW: 'sw'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  REGISTER: 'Registration successful!',
  TRANSACTION_INITIATED: 'Transaction initiated successfully!',
  TRANSACTION_SUCCESS: 'Transaction completed successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// Default Values
export const DEFAULTS = {
  TIMEZONE: 'Africa/Nairobi',
  LANGUAGE: 'en',
  THEME: 'light',
  CURRENCY: 'KES',
  DATE_FORMAT: 'MMM dd, yyyy HH:mm',
  PAGE_SIZE: 20
};

// Export all constants
export default {
  APP_NAME,
  APP_VERSION,
  COMPANY_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  API_TIMEOUT,
  MAX_FILE_SIZE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS_COLORS,
  TRANSACTION_STATUS_ICONS,
  USER_ROLES,
  ROLE_PERMISSIONS,
  NOTIFICATION_CHANNELS,
  DATE_FORMATS,
  PAGINATION_CONFIG,
  VALIDATION_LIMITS,
  CURRENCY,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS
};