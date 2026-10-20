import axios from "axios";
import { API_URL } from "../utils/constants";
import { useAuthStore } from "../store/authStore";

let guestRenewal;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("freshcart_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const guestKey = localStorage.getItem("freshcart_guest_key");
    if (
      error.response?.status === 401 &&
      request &&
      !request.guestRetried &&
      !request.url.startsWith("/auth/") &&
      guestKey &&
      useAuthStore.getState().user?.role === "customer"
    ) {
      request.guestRetried = true;
      try {
        if (!guestRenewal)
          guestRenewal = api
            .post("/auth/guest", { guest_key: guestKey })
            .then(({ data }) => {
              useAuthStore.getState().login(data.user, data.accessToken);
            })
            .finally(() => {
              guestRenewal = null;
            });
        await guestRenewal;
        return api(request);
      } catch {
        return Promise.reject(error);
      }
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("freshcart_token");
      localStorage.removeItem("freshcart_user");
    }
    return Promise.reject(error);
  },
);

export default api;
