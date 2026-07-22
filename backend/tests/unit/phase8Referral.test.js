import { describe, expect, it } from 'vitest';

function applyReferralOnce(state, code, referredUserId) {
  const referral = state.codes.get(code);
  if (!referral) throw new Error('Invalid referral code');
  if (referral.userId === referredUserId) throw new Error('Cannot redeem own referral code');
  if (state.redemptions.has(referredUserId)) throw new Error('You have already redeemed a referral code');

  state.redemptions.add(referredUserId);
  state.transactions.push({ userId: referral.userId, amount: 50, type: 'referral_bonus' });
  state.transactions.push({ userId: referredUserId, amount: 50, type: 'referral_bonus' });
}

describe('referral redemption contract', () => {
  it('credits both parties exactly once and rejects repeats', () => {
    const state = {
      codes: new Map([['ABCD1234', { userId: 1 }]]),
      redemptions: new Set(),
      transactions: [],
    };

    applyReferralOnce(state, 'ABCD1234', 2);
    expect(state.transactions).toHaveLength(2);
    expect(state.transactions.map(tx => tx.userId).sort()).toEqual([1, 2]);

    expect(() => applyReferralOnce(state, 'ABCD1234', 2)).toThrow('already redeemed');
    expect(state.transactions).toHaveLength(2);
  });
});
