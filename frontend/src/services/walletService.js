import api from './api';

export const getWallet = async () => {
  const { data } = await api.get('/wallet');
  return data;
};

export const getMyReferralCode = async () => {
  const { data } = await api.get('/referral/my-code');
  return data;
};

export const redeemReferralCode = async (code) => {
  const { data } = await api.post('/referral/redeem', { code });
  return data;
};
