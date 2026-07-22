const flagDefaults = {
  smartPantry: true,
  handsFreeCooking: true,
  weeklyMealPlanner: true,
  nutritionCostCard: true,
  dietaryFilters: true,
  socialProofGamification: true,
  voiceQuickAdd: true,
  pushNotificationsPwa: true,
  predictiveReorderFeed: true,
  referralWallet: true,
};

const envNames = {
  smartPantry: 'VITE_FEATURE_SMART_PANTRY',
  handsFreeCooking: 'VITE_FEATURE_HANDS_FREE_COOKING',
  weeklyMealPlanner: 'VITE_FEATURE_WEEKLY_MEAL_PLANNER',
  nutritionCostCard: 'VITE_FEATURE_NUTRITION_COST_CARD',
  dietaryFilters: 'VITE_FEATURE_DIETARY_FILTERS',
  socialProofGamification: 'VITE_FEATURE_SOCIAL_PROOF_GAMIFICATION',
  voiceQuickAdd: 'VITE_FEATURE_VOICE_QUICK_ADD',
  pushNotificationsPwa: 'VITE_FEATURE_PUSH_NOTIFICATIONS_PWA',
  predictiveReorderFeed: 'VITE_FEATURE_PREDICTIVE_REORDER_FEED',
  referralWallet: 'VITE_FEATURE_REFERRAL_WALLET',
};

function enabled(value, fallback) {
  if (value === undefined) return fallback;
  return !['0', 'false', 'off', 'no'].includes(String(value).toLowerCase());
}

export const featureFlags = Object.fromEntries(
  Object.entries(flagDefaults).map(([key, fallback]) => [
    key,
    enabled(import.meta.env[envNames[key]], fallback),
  ])
);
