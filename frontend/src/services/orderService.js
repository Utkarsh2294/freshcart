import api from './api';

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getOrders = async (page = 1) => {
  const { data } = await api.get('/orders', { params: { page } });
  return data;
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const getTracking = async (id) => {
  const { data } = await api.get(`/orders/${id}/tracking`);
  return data;
};
