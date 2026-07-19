import api from './api';
import { normalizeProduct } from './productService';

const normalizeCart = (data = {}) => {
  const rawItems = data.items || data.cart?.items || [];
  const items = rawItems.map((item) => {
    const product = normalizeProduct(item.product || item);
    const quantity = Number(item.quantity || item.qty || 0);

    return {
      ...item,
      id: item.id,
      _id: item.id,
      productId: item.productId || item.product_id || product.id,
      quantity,
      price: Number(item.price || product.price || 0),
      imageUrl: item.imageUrl || item.image_url || product.imageUrl,
      product,
    };
  });

  return {
    ...data,
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    walletBalance: Number(data.walletBalance || data.wallet_balance_available || 0),
    darkStoreId: data.darkStoreId || data.dark_store_id || null,
  };
};

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return normalizeCart(data);
};

export const addItem = async (productId, quantity = 1, source = 'manual') => {
  const { data } = await api.post('/cart/items', { product_id: productId, quantity, source });
  return data;
};

export const updateItem = async (itemId, quantity) => {
  const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
  return data;
};

export const removeItem = async (itemId) => {
  const { data } = await api.delete(`/cart/items/${itemId}`);
  return data;
};
