export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^254[17]\d{8}$/;
  return phoneRegex.test(phone);
};

export const validateAmount = (amount) => {
  const amountNum = parseFloat(amount);
  return !isNaN(amountNum) && amountNum > 0;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateAccountReference = (reference) => {
  return reference && reference.length >= 1 && reference.length <= 12;
};

export const validateTransactionDesc = (description) => {
  return description && description.length >= 1 && description.length <= 13;
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateFutureDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date > today;
};

export const validatePastDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date <= today;
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
};

export const validateInteger = (value, min = null, max = null) => {
  const num = parseInt(value, 10);
  if (isNaN(num) || !Number.isInteger(num)) return false;
  
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  if (!file) return false;

  // Check file size
  if (file.size > maxSize) {
    return false;
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return false;
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return false;
    }
  }

  return true;
};

export const validateKenyanID = (idNumber) => {
  // Basic Kenyan ID validation (8 digits)
  const idRegex = /^\d{8}$/;
  return idRegex.test(idNumber);
};

export const createValidator = (validators, customMessage = null) => {
  return (value) => {
    for (const validator of validators) {
      if (!validator(value)) {
        return customMessage || 'Validation failed';
      }
    }
    return null;
  };
};

export default {
  validateEmail,
  validatePhone,
  validateAmount,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePassword,
  validateAccountReference,
  validateTransactionDesc,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateDateRange,
  validateNumber,
  validateInteger,
  validateURL,
  validateFile,
  validateKenyanID,
  createValidator
};