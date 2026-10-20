import { create } from "zustand";
import * as cartService from "../services/cartService";
import { applyOptimisticSwap, cartTotal } from "./cartSwap";

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  walletBalance: 0,
  darkStoreId: null,
  isLoading: false,
  pendingItems: [],
  error: "",

  fetchCart: async () => {
    set({ isLoading: true, error: "" });
    try {
      const data = await cartService.getCart();
      set({
        items: data.items || [],
        total: data.total || 0,
        walletBalance: data.walletBalance || 0,
        darkStoreId: data.darkStoreId,
      });
    } catch (err) {
      set({ error: "Your cart could not be loaded. Please try again." });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, qty = 1, source = "manual") => {
    try {
      await cartService.addItem(productId, qty, source);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateItem: async (itemId, qty) => {
    const key = String(itemId);
    if (get().pendingItems.includes(key)) return;
    set((state) => ({ pendingItems: [...state.pendingItems, key] }));
    try {
      await cartService.updateItem(itemId, qty);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set((state) => ({
        pendingItems: state.pendingItems.filter((id) => id !== key),
      }));
    }
  },

  removeItem: async (itemId) => {
    const key = String(itemId);
    if (get().pendingItems.includes(key)) return;
    set((state) => ({ pendingItems: [...state.pendingItems, key] }));
    try {
      await cartService.removeItem(itemId);
      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set((state) => ({
        pendingItems: state.pendingItems.filter((id) => id !== key),
      }));
    }
  },

  getSwapOptions: async (itemId) => {
    return cartService.getSwapOptions(itemId);
  },

  swapItem: async (itemId, option) => {
    const previousItems = get().items;
    const optimisticItems = applyOptimisticSwap(previousItems, itemId, option);
    set({ items: optimisticItems, total: cartTotal(optimisticItems) });

    try {
      await cartService.swapItem(itemId, option.id);
      await get().fetchCart();
    } catch (err) {
      set({ items: previousItems, total: cartTotal(previousItems) });
      console.error(err);
      throw err;
    }
  },

  clearCart: () => set({ items: [], total: 0 }),
}));
