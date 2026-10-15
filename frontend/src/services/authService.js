import api from "./api";

export const createGuestSession = async (guestKey) => {
  const { data } = await api.post("/auth/guest", { guest_key: guestKey });
  return data;
};
