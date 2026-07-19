export const formatPrice = (amount) => {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatCurrency = formatPrice;

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{5})(\d{5})/, '$1-$2');
};

export const truncate = (str, len) => {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
};
