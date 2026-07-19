import api from './api';

const PRODUCT_COLORS = {
  dairy: ['#EEF2FF', '#EDE9FE'],
  fruit: ['#ECFDF5', '#FEF3C7'],
  vegetable: ['#F0FDF4', '#DBEAFE'],
  snack: ['#FFF7ED', '#FCE7F3'],
  beverage: ['#EFF6FF', '#ECFEFF'],
  staple: ['#FEFCE8', '#F5F3FF'],
  personal: ['#FDF2F8', '#EEF2FF'],
  default: ['#F7F8FA', '#ECEEF2'],
};

export const normalizeProduct = (product = {}) => {
  const id = product.id ?? product._id;
  const categoryName = product.category || product.category_name || '';
  const searchText = `${product.name || ''} ${categoryName}`.toLowerCase();
  const colorKey = Object.keys(PRODUCT_COLORS).find(key => searchText.includes(key)) || 'default';
  const [visualFrom, visualTo] = PRODUCT_COLORS[colorKey];

  return {
    ...product,
    id,
    _id: id,
    imageUrl: product.imageUrl || product.image_url || '',
    category: categoryName,
    brand: product.brand || product.brand_name || '',
    stockQty: Number(product.stockQty ?? product.stock_qty ?? 0),
    inStock: product.inStock ?? product.in_stock ?? Number(product.stock_qty ?? product.stockQty ?? 0) > 0,
    price: Number(product.price ?? 0),
    mrp: Number(product.mrp ?? product.price ?? 0),
    discount: Number(product.discount ?? 0),
    visualFrom,
    visualTo,
  };
};

const normalizeListResponse = (response, limit = 20) => {
  const products = response.products || response.data || [];
  const meta = response.meta || {};
  const currentLimit = Number(meta.limit || limit || 20);
  const total = Number(response.total ?? meta.total ?? products.length);

  return {
    products: products.map(normalizeProduct),
    total,
    totalPages: Number(response.totalPages || Math.max(1, Math.ceil(total / currentLimit))),
    page: Number(meta.page || response.page || 1),
  };
};

const normalizeParams = (params = {}) => {
  const {
    query,
    search,
    minPrice,
    maxPrice,
    min_price,
    max_price,
    price_min,
    price_max,
    ...rest
  } = params;

  const normalized = {
    ...rest,
    search: search || query || undefined,
    min_price: min_price ?? price_min ?? minPrice ?? undefined,
    max_price: max_price ?? price_max ?? maxPrice ?? undefined,
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
};

export const getProducts = async (params = {}) => {
  const normalizedParams = normalizeParams(params);
  const { data } = await api.get('/products', { params: normalizedParams });
  return normalizeListResponse(data, normalizedParams.limit);
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return normalizeProduct(data);
};

export const getAlsoBought = async (id) => {
  const { data } = await api.get(`/products/${id}/also-bought`);
  return data.map(normalizeProduct);
};

export const searchSuggest = async (q) => {
  const { data } = await api.get('/search/suggest', { params: { q } });
  return data;
};
