import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';

export const useProducts = () => {
  const store = useProductStore();
  
  useEffect(() => {
    store.fetchProducts();
  }, []);
  
  return store;
};
