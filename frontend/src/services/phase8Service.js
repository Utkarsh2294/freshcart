import api from './api';

export const getPredictiveReorder = async () => {
  const { data } = await api.get('/phase8/predictive-reorder');
  return data;
};

export const parseVoiceQuickAdd = async (transcript) => {
  const { data } = await api.post('/phase8/voice-quick-add/parse', { transcript });
  return data;
};

export const planWeeklyMeals = async ({ preferences, days = 7 }) => {
  const { data } = await api.post('/phase8/meal-planner/week', { preferences, days });
  return data;
};

export const getPantry = async () => {
  const { data } = await api.get('/phase8/pantry');
  return data;
};

export const addPantryItem = async (ingredientName) => {
  const { data } = await api.post('/phase8/pantry', { ingredient_name: ingredientName });
  return data;
};

export const getDietaryProfile = async () => {
  const { data } = await api.get('/phase8/dietary-profile');
  return data;
};

export const updateDietaryProfile = async (dietaryTags) => {
  const { data } = await api.put('/phase8/dietary-profile', { dietary_tags: dietaryTags });
  return data;
};
