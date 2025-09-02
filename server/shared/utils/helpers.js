const crypto = require('crypto');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Ensure it starts with 254 for Kenyan numbers
  if (digits.startsWith('0')) {
    return '254' + digits.substring(1);
  }
  
  if (digits.startsWith('7') || digits.startsWith('1')) {
    return '254' + digits;
  }
  
  return digits;
};

const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const sanitizeObject = (obj, fieldsToRemove = ['password', 'token', 'secret']) => {
  const sanitized = { ...obj };
  
  fieldsToRemove.forEach(field => {
    if (sanitized[field]) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation, maxRetries = 3, delayMs = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * Math.pow(2, i)); // Exponential backoff
    }
  }
};

module.exports = {
  generateRandomString,
  formatPhoneNumber,
  formatCurrency,
  sanitizeObject,
  delay,
  retryOperation
};