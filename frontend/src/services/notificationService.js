import api from './api';

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = window.atob(base64);
  return Uint8Array.from([...bytes].map(character => character.charCodeAt(0)));
}

export const enablePushNotifications = async () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error('Push notifications are not configured yet.');

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await subscribe(subscription.toJSON());
  return subscription;
};

export const subscribe = async (subscription) => {
  const { data } = await api.post('/notifications/subscribe', subscription);
  return data;
};

export const unsubscribe = async () => {
  if (!('serviceWorker' in navigator)) return { success: true };
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return { success: true };
  const { data } = await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
  await subscription.unsubscribe();
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
