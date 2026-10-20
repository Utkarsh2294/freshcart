import { useProductStore } from "../store/productStore";

export const useProducts = () => {
  return useProductStore();
};
