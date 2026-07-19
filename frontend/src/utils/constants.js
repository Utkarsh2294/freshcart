export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// Import and re-export shared constants if available, else define defaults
export const CONSTANTS = {
  ORDER_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
  }
};
