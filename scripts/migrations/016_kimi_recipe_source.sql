-- Phase 4 provider correction: cached Gemini/demo rows must not bypass Kimi.
DELETE FROM recipe_cache WHERE source = 'gemini_api';

ALTER TABLE recipe_cache
  ALTER COLUMN source SET DEFAULT 'kimi_api';
