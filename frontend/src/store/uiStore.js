import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark',
  sidebarOpen: false,
  toasts: [],

  toggleTheme: () => set((state) => {
    const newTheme = !state.isDarkMode;
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newTheme };
  }),

  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  addToast: (toast) => set((state) => {
    const id = Date.now();
    return { toasts: [...state.toasts, { ...toast, id }] };
  }),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));
