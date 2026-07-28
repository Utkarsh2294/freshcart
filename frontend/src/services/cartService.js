import api from './api';
import { normalizeProduct } from './productService';

const GUEST_CART_KEY = 'freshcart_guest_cart';

const hasToken = () => Boolean(localStorage.getItem('freshcart_token'));

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

const readGuestCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  return normalizeCart({ items });
};

export const getCart = async () => {
  if (!hasToken()) {
    return normalizeCart({ items: readGuestCart() });
  }
  const { data } = await api.get('/cart');
  return normalizeCart(data);
};

export const addItem = async (productId, quantity = 1, source = 'manual') => {
  if (!hasToken()) {
    const items = readGuestCart();
    const existing = items.find(item => String(item.product_id || item.productId) === String(productId));
    if (existing) {
      existing.quantity = Number(existing.quantity || existing.qty || 0) + Number(quantity);
      existing.qty = existing.quantity;
      existing.source = existing.source === 'ai_recipe' ? existing.source : source;
      writeGuestCart(items);
      return { success: true };
    }

    const { data: product } = await api.get(`/products/${productId}`);
    const normalized = normalizeProduct(product);
    items.push({
      id: `guest-${productId}`,
      _id: `guest-${productId}`,
      product_id: normalized.id,
      productId: normalized.id,
      quantity: Number(quantity),
      qty: Number(quantity),
      price: normalized.price,
      image_url: normalized.imageUrl,
      imageUrl: normalized.imageUrl,
      source,
      product: normalized,
    });
    writeGuestCart(items);
    return { success: true };
  }
  const { data } = await api.post('/cart/items', { product_id: productId, quantity, source });
  return data;
};

export const updateItem = async (itemId, quantity) => {
  if (!hasToken()) {
    const next = readGuestCart()
      .map(item => String(item.id || item._id) === String(itemId) ? { ...item, quantity, qty: quantity } : item)
      .filter(item => Number(item.quantity || item.qty) > 0);
    writeGuestCart(next);
    return { success: true };
  }
  const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
  return data;
};

export const removeItem = async (itemId) => {
  if (!hasToken()) {
    writeGuestCart(readGuestCart().filter(item => String(item.id || item._id) !== String(itemId)));
    return { success: true };
  }
  const { data } = await api.delete(`/cart/items/${itemId}`);
  return data;
};

export const getSwapOptions = async (itemId) => {
  const { data } = await api.get(`/cart/items/${itemId}/swap-options`);
  return {
    ...data,
    item: data.item,
    options: (data.options || []).map(normalizeProduct),
  };
};

export const swapItem = async (itemId, newProductId) => {
  const { data } = await api.patch(`/cart/items/${itemId}/swap`, { new_product_id: newProductId });
  return data;
};

export const mergeGuestCart = async () => {
  if (!hasToken()) return;
  const items = readGuestCart();
  if (!items.length) return;

  for (const item of items) {
    await api.post('/cart/items', {
      product_id: item.product_id || item.productId,
      quantity: item.quantity || item.qty || 1,
      source: item.source || 'manual',
    });
  }
  localStorage.removeItem(GUEST_CART_KEY);
};
