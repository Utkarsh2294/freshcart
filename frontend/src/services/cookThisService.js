import api from './api';
import { normalizeProduct } from './productService';

const normalizeMatch = (match) => ({
  ...match,
  product: match.product ? normalizeProduct(match.product) : null,
  alternatives: (match.alternatives || []).map(item => ({
    ...item,
    product: normalizeProduct(item.product),
  })),
});

export const generateRecipe = async (dishName, servings) => {
  const { data } = await api.post('/ai/cook-this/generate', {
    dish_name: dishName,
    servings: Number(servings),
  });
  return data;
};

export const matchIngredients = async (ingredients, servings = 1) => {
  const { data } = await api.post('/ai/cook-this/match', { ingredients, servings });
  return {
    matches: (data.matches || []).map(normalizeMatch),
    pantry_note: data.pantry_note || '',
    nutrition: data.nutrition || null,
    dietary_tags_applied: data.dietary_tags_applied || [],
  };
};

export const addMatchedItemsToCart = async (items) => {
  const { data } = await api.post('/ai/cook-this/add-to-cart', { items });
  return data;
};
