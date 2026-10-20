import { create } from "zustand";
import * as orderService from "../services/orderService";

const normalizeOrder = (order = {}) => ({
  ...order,
  id: order.id,
  _id: String(order._id || order.id || ""),
  createdAt: order.createdAt || order.created_at,
  status: String(order.status || "pending").toUpperCase(),
  walletAmountApplied: Number(
    order.walletAmountApplied || order.wallet_amount_applied || 0,
  ),
  items: Array.isArray(order.items)
    ? order.items.map((item) => ({
        ...item,
        product: item.product || {
          id: item.product_id,
          name: item.name || "Product",
          image_url: item.image_url,
        },
      }))
    : [],
});

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  tracking: null,
  isLoading: false,
  error: "",

  fetchOrders: async (page = 1) => {
    set({ isLoading: true, error: "" });
    try {
      const data = await orderService.getOrders(page);
      const orders = Array.isArray(data) ? data : data.orders || [];
      set({ orders: orders.map(normalizeOrder) });
    } catch (err) {
      set({ error: "Orders could not be loaded. Please try again." });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const data = await orderService.createOrder(orderData);
      const order = normalizeOrder(data);
      set({ currentOrder: order });
      return order;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTracking: async (id) => {
    set({ isLoading: true, error: "", tracking: null });
    try {
      const data = await orderService.getTracking(id);
      set({ tracking: data });
    } catch (err) {
      set({
        error:
          err.response?.data?.error ||
          "Tracking could not be loaded. Please try again.",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
