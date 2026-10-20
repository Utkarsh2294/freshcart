import { create } from "zustand";
import { resolveInitialDarkMode } from "../utils/theme.js";

const storedTheme = localStorage.getItem("theme");
const initialDarkMode = resolveInitialDarkMode(
  storedTheme,
  window.matchMedia("(prefers-color-scheme: dark)").matches,
);

export const useUiStore = create((set) => ({
  isDarkMode: initialDarkMode,
  sidebarOpen: false,
  toasts: [],

  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDarkMode;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      if (newTheme) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      return { isDarkMode: newTheme };
    }),

  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  addToast: (toast) =>
    set((state) => {
      const id = crypto.randomUUID();
      return { toasts: [...state.toasts.slice(-4), { ...toast, id }] };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
