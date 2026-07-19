import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const store = useCartStore();
  return store;
};
