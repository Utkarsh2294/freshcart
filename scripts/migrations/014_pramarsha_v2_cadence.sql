-- Pramarsha 2.0 Phase B: per-user, per-category reorder cadence tracking
-- Populated by the nightly computeCadenceAndStreaks job, never by Pramarsha.
-- Freshcart-owned table — does not touch Pramarsha's schema (§8 constraint 2).

CREATE TABLE IF NOT EXISTS user_category_cadence (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  median_reorder_days NUMERIC,
  last_ordered_at TIMESTAMPTZ,
  order_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_user_category_cadence_user
  ON user_category_cadence(user_id);
