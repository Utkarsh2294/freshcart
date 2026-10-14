export const API_URL = import.meta.env.VITE_API_URL || "/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

// Import and re-export shared constants if available, else define defaults
export const CONSTANTS = {
  ORDER_STATUS: {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  },
};
