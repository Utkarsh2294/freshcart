import api from './api';

export const getSuggestions = async (q) => {
  const { data } = await api.get('/search/suggest', { params: { q } });
  return data;
};
