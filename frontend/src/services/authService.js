import api from './api';

export const loginWithEmail = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const signupWithEmail = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const refreshToken = async (token) => {
  const { data } = await api.post('/auth/refresh', { refreshToken: token });
  return data;
};
