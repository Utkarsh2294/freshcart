import { create } from 'zustand';
import * as walletService from '../services/walletService';

export const useWalletStore = create((set) => ({
  balance: 0,
  transactions: [],
  referralCode: null,
  isLoading: false,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const data = await walletService.getWallet();
      set({ balance: data.balance || 0, transactions: data.transactions || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReferralCode: async () => {
    try {
      const data = await walletService.getMyReferralCode();
      set({ referralCode: data.code });
    } catch (err) {
      console.error(err);
    }
  },

  redeemCode: async (code) => {
    try {
      await walletService.redeemReferralCode(code);
      const data = await walletService.getWallet();
      set({ balance: data.balance || 0, transactions: data.transactions || [] });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
