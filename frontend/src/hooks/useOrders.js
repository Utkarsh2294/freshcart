import { useOrderStore } from '../store/orderStore';

export const useOrders = () => {
  const store = useOrderStore();
  return store;
};
