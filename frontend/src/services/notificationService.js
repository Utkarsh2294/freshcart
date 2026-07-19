import api from './api';

export const subscribe = async (subscription) => {
  const { data } = await api.post('/notifications/subscribe', subscription);
  return data;
};

export const unsubscribe = async () => {
  const { data } = await api.post('/notifications/unsubscribe');
  return data;
};
