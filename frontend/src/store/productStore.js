import { create } from 'zustand';
import * as productService from '../services/productService';

export const useProductStore = create((set, get) => ({
  products: [],
  totalPages: 1,
  isLoading: false,
  filters: {
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 10000,
    sort: 'relevance'
  },

  fetchProducts: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const data = await productService.getProducts({ page, ...filters });
      set({ products: data.products || [], totalPages: data.totalPages || 1 });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchProducts(1);
  }
}));
