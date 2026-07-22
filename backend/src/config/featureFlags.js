const defaultFlags = {
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

const envMap = {
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

function parseFlag(value, fallback) {
  if (value === undefined) return fallback;
  return !['0', 'false', 'off', 'no'].includes(String(value).toLowerCase());
}

export const featureFlags = Object.fromEntries(
  Object.entries(defaultFlags).map(([key, fallback]) => [
    key,
    parseFlag(process.env[envMap[key]], fallback),
  ])
);

export function requireFeature(flagName, res) {
  if (featureFlags[flagName]) return true;
  res.status(404).json({ error: 'feature_disabled', feature: flagName });
  return false;
}
