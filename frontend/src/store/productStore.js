import { create } from "zustand";
import * as productService from "../services/productService";

export const useProductStore = create((set, get) => ({
  products: [],
  totalPages: 1,
  isLoading: false,
  error: "",
  page: 1,
  total: 0,
  requestId: 0,
  filters: {
    category: "",
    brand: "",
    minPrice: 0,
    maxPrice: 10000,
    sort: "relevance",
  },

  fetchProducts: async (page = 1) => {
    const requestId = get().requestId + 1;
    set({ isLoading: true, error: "", requestId });
    try {
      const { filters } = get();
      const data = await productService.getProducts({
        page,
        limit: 24,
        ...filters,
      });
      if (get().requestId !== requestId) return;
      set({
        products: data.products || [],
        totalPages: data.totalPages || 1,
        page: data.page,
        total: data.total,
      });
    } catch (err) {
      if (get().requestId === requestId)
        set({
          products: [],
          error: "Products could not be loaded. Please try again.",
        });
    } finally {
      if (get().requestId === requestId) set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchProducts(1);
  },
}));
