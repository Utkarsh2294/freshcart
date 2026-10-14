-- Phase 4: Cook-with-AI — recipe cache
--
-- Caches successful Kimi K3 responses keyed on (normalized dish_name,
-- servings), so a repeat request never re-calls the third-party API.
-- This is the ONLY table this phase adds — no recipes table, no FAISS
-- index, no local fine-tuning artifacts. It is purely a response cache.
--
-- Adjust to your migration tool's conventions (this is plain SQL; wrap it
-- in a node-pg-migrate / knex / Prisma migration file as needed).

-- +migrate Up

CREATE TABLE IF NOT EXISTS recipe_cache (
    id          BIGSERIAL PRIMARY KEY,
    dish_name   VARCHAR(200)  NOT NULL,  -- normalized: trimmed, lowercased, single-spaced
    servings    SMALLINT      NOT NULL CHECK (servings > 0 AND servings <= 50),
    title       VARCHAR(255)  NOT NULL,
    steps       JSONB         NOT NULL,
    ingredients JSONB         NOT NULL,
    source      VARCHAR(20)   NOT NULL DEFAULT 'kimi_api',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT recipe_cache_dish_servings_unique UNIQUE (dish_name, servings)
);

-- The unique constraint above already gives us an index for the exact
-- lookup pattern the API uses (WHERE dish_name = $1 AND servings = $2),
-- so no separate index is needed — added explicitly anyway for clarity
-- and in case the constraint is ever relaxed to non-unique later.
CREATE INDEX IF NOT EXISTS idx_recipe_cache_lookup
    ON recipe_cache (dish_name, servings);
