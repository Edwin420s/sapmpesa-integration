export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatCurrencyWithoutSymbol = (amount, decimals = 2) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

export const parseCurrency = (value) => {
  if (typeof value !== 'string') return value;
  
  // Remove currency symbols and thousands separators
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

export const formatPercentage = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

export const formatLargeNumber = (number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export const calculateTotal = (items, field = 'amount') => {
  return items.reduce((total, item) => total + (parseFloat(item[field]) || 0), 0);
};

export const calculateAverage = (items, field = 'amount') => {
  if (items.length === 0) return 0;
  const total = calculateTotal(items, field);
  return total / items.length;
};

export const formatRange = (min, max, currency = 'KES') => {
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};

export const formatCurrencyCompact = (amount, currency = 'KES') => {
  if (amount >= 1000000) {
    return formatCurrency(amount / 1000000, currency) + 'M';
  } else if (amount >= 1000) {
    return formatCurrency(amount / 1000, currency) + 'K';
  }
  return formatCurrency(amount, currency);
};

export default {
  formatCurrency,
  formatCurrencyWithoutSymbol,
  parseCurrency,
  formatPercentage,
  formatLargeNumber,
  calculateTotal,
  calculateAverage,
  formatRange,
  formatCurrencyCompact
};