import { afterEach, describe, expect, it, vi } from 'vitest';

const flagEnv = {
  smartPantry: 'FEATURE_SMART_PANTRY',
  handsFreeCooking: 'FEATURE_HANDS_FREE_COOKING',
  weeklyMealPlanner: 'FEATURE_WEEKLY_MEAL_PLANNER',
  nutritionCostCard: 'FEATURE_NUTRITION_COST_CARD',
  dietaryFilters: 'FEATURE_DIETARY_FILTERS',
  socialProofGamification: 'FEATURE_SOCIAL_PROOF_GAMIFICATION',
  voiceQuickAdd: 'FEATURE_VOICE_QUICK_ADD',
  pushNotificationsPwa: 'FEATURE_PUSH_NOTIFICATIONS_PWA',
  predictiveReorderFeed: 'FEATURE_PREDICTIVE_REORDER_FEED',
  referralWallet: 'FEATURE_REFERRAL_WALLET',
};

afterEach(() => {
  for (const envName of Object.values(flagEnv)) delete process.env[envName];
  vi.resetModules();
});

describe('Phase 8 feature flags', () => {
  it.each(Object.entries(flagEnv))('can disable %s independently', async (flag, envName) => {
    process.env[envName] = 'false';
    vi.resetModules();
    const { featureFlags, requireFeature } = await import('../../src/config/featureFlags.js');
    const response = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };

    expect(featureFlags[flag]).toBe(false);
    expect(requireFeature(flag, response)).toBe(false);
    expect(response).toMatchObject({ statusCode: 404, body: { error: 'feature_disabled', feature: flag } });
    for (const otherFlag of Object.keys(flagEnv).filter(name => name !== flag)) {
      expect(featureFlags[otherFlag]).toBe(true);
    }
  });
});
