import { useWalletStore } from '../store/walletStore';

export const useWallet = () => {
  const store = useWalletStore();
  return store;
};
