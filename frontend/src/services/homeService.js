import api from './api';
import { normalizeProduct } from './productService';

export const getHomeRecommendations = async () => {
  const { data } = await api.get('/home/recommendations');
  return {
    ...data,
    recommendations: (data.recommendations || []).map(item => ({
      ...item,
      products: (item.products || []).map(normalizeProduct),
    })),
  };
};
