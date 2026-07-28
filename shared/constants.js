/** Application-wide constants */

export const WALLET_CAP_PERCENT = 50; // Wallet may cover at most 50% of order value
export const REFERRAL_BONUS_RUPEES = 50; // Rs 50 for both referrer and new user

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_SUGGESTIONS: 6,
  TRIGRAM_THRESHOLD: 0.3,
};

export const DELIVERY = {
  BASE_FEE_RUPEES: 15,
  PACKAGING_FEE_RUPEES: 5,
  FREE_DELIVERY_THRESHOLD: 499,
  DEFAULT_ETA_MINUTES: 25,
};

export const RIDER_SIMULATION = {
  UPDATE_INTERVAL_MS: 3000, // Update position every 3 seconds
  TOTAL_STEPS: 100, // Number of interpolation steps
};
