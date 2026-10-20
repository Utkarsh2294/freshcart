import { create } from "zustand";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("freshcart_user")) || null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem("freshcart_token") || null,
  isAuthenticated: !!localStorage.getItem("freshcart_token"),

  login: (userData, token) => {
    localStorage.setItem("freshcart_user", JSON.stringify(userData));
    localStorage.setItem("freshcart_token", token);
    set({ user: userData, token, isAuthenticated: true });
  },
}));
