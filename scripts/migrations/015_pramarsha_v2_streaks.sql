-- Pramarsha 2.0 Phase C: per-user, per-reason_tag streak tracking
-- Populated by the nightly computeCadenceAndStreaks job, never by Pramarsha.
-- Freshcart-owned table — does not touch Pramarsha's schema (§8 constraint 2).

CREATE TABLE IF NOT EXISTS user_reason_tag_streaks (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason_tag TEXT NOT NULL,
  recurrence_type TEXT NOT NULL DEFAULT 'daily'
    CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
  current_streak INTEGER DEFAULT 0,
  last_matched_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, reason_tag)
);

CREATE INDEX IF NOT EXISTS idx_user_reason_tag_streaks_user
  ON user_reason_tag_streaks(user_id);
