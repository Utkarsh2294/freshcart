-- Switch Cook with AI from Kimi/OpenRouter to Groq.
DELETE FROM recipe_cache WHERE source = 'kimi_api';

ALTER TABLE recipe_cache
  ALTER COLUMN source SET DEFAULT 'groq_api';
