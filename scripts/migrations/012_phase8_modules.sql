-- Phase 8: independent differentiator modules

CREATE TABLE IF NOT EXISTS user_pantry (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_pantry_user ON user_pantry(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_pantry_user_ingredient_unique
  ON user_pantry(user_id, LOWER(ingredient_name));

ALTER TABLE recipe_cache
  ADD COLUMN IF NOT EXISTS nutrition JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10,2);

CREATE TABLE IF NOT EXISTS nutrition_lookup (
  ingredient_name TEXT PRIMARY KEY,
  calories_per_100g NUMERIC(8,2) NOT NULL DEFAULT 0,
  protein_per_100g NUMERIC(8,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO nutrition_lookup (ingredient_name, calories_per_100g, protein_per_100g) VALUES
  ('paneer', 265, 18.3),
  ('tomato', 18, 0.9),
  ('tomato puree', 38, 1.6),
  ('onion', 40, 1.1),
  ('butter', 717, 0.9),
  ('cream', 340, 2.1),
  ('milk', 61, 3.2),
  ('rice', 365, 7.1),
  ('atta', 340, 13.2),
  ('oil', 884, 0),
  ('dal', 352, 24.6),
  ('egg', 155, 13),
  ('bread', 265, 9)
ON CONFLICT (ingredient_name) DO UPDATE
SET calories_per_100g = EXCLUDED.calories_per_100g,
    protein_per_100g = EXCLUDED.protein_per_100g,
    updated_at = NOW();

CREATE TABLE IF NOT EXISTS user_dietary_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dietary_tags TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_view_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_view_events_rollup
  ON product_view_events(product_id, city, created_at);

CREATE TABLE IF NOT EXISTS order_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  city TEXT,
  event_type TEXT NOT NULL DEFAULT 'ordered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_rollup
  ON order_events(product_id, city, event_type, created_at);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  label TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

CREATE TABLE IF NOT EXISTS ai_recipe_activity (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recipes_generated INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, activity_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint_unique
  ON push_subscriptions(endpoint);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  order_status BOOLEAN NOT NULL DEFAULT TRUE,
  back_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  price_drop BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('order_status', 'back_in_stock', 'price_drop', 'test')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS referral_redemptions (
  id SERIAL PRIMARY KEY,
  code_id INTEGER NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referrer_transaction_id INTEGER REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  referred_transaction_id INTEGER REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_user_id),
  UNIQUE(code_id, referred_user_id)
);

ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check
  CHECK (type IN ('cashback', 'referral_bonus', 'refund', 'redeemed', 'goodwill_credit'));
