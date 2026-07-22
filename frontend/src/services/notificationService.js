import api from './api';

export const subscribe = async (subscription) => {
  const { data } = await api.post('/notifications/subscribe', subscription);
  return data;
};

export const unsubscribe = async () => {
  const { data } = await api.post('/notifications/unsubscribe');
  return data;
};

export const getPreferences = async () => {
  const { data } = await api.get('/notifications/preferences');
  return data;
};

export const updatePreferences = async (preferences) => {
  const { data } = await api.put('/notifications/preferences', preferences);
  return data;
};

export const sendTestNotification = async () => {
  const { data } = await api.post('/notifications/test', {
    trigger_type: 'order_status',
    title: 'Freshcart test push',
    body: 'Order-status push delivery is wired.',
  });
  return data;
};
