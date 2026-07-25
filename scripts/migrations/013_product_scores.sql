-- Phase 2: product affinity scores table written by recommendation-service
CREATE TABLE IF NOT EXISTS product_scores (
  product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  final_score NUMERIC(5,4) NOT NULL DEFAULT 0.5000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_scores_score ON product_scores(final_score DESC);
