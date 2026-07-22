import { create } from 'zustand';
import * as cartService from '../services/cartService';

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  walletBalance: 0,
  darkStoreId: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const data = await cartService.getCart();
      set({
        items: data.items || [],
        total: data.total || 0,
        walletBalance: data.walletBalance || 0,
        darkStoreId: data.darkStoreId,
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, qty = 1, source = 'manual') => {
    try {
      await cartService.addItem(productId, qty, source);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateItem: async (itemId, qty) => {
    try {
      await cartService.updateItem(itemId, qty);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  getSwapOptions: async (itemId) => {
    return cartService.getSwapOptions(itemId);
  },

  swapItem: async (itemId, newProductId) => {
    try {
      await cartService.swapItem(itemId, newProductId);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  clearCart: () => set({ items: [], total: 0 }),
}));
