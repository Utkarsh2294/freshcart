import { create } from 'zustand';
import * as orderService from '../services/orderService';

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  tracking: null,
  isLoading: false,

  fetchOrders: async (page = 1) => {
    set({ isLoading: true });
    try {
      const data = await orderService.getOrders(page);
      set({ orders: Array.isArray(data) ? data : data.orders || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const data = await orderService.createOrder(orderData);
      set({ currentOrder: data });
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTracking: async (id) => {
    set({ isLoading: true });
    try {
      const data = await orderService.getTracking(id);
      set({ tracking: data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  }
}));
