import api from './api';

export const loginWithEmail = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const signupWithEmail = async (name, email, password) => {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data;
};

export const requestOtp = async (phone) => {
  const { data } = await api.post('/auth/otp/request', { phone });
  return data;
};

export const verifyOtp = async (phone, otp, name) => {
  const { data } = await api.post('/auth/otp/verify', { phone, otp, name });
  return data;
};

export const refreshToken = async (token) => {
  const { data } = await api.post('/auth/refresh', { refreshToken: token });
  return data;
};
