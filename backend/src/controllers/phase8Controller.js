import Joi from 'joi';
import { pool } from '../config/database.js';
import { requireFeature } from '../config/featureFlags.js';
import { matchIngredientsToProducts } from '../services/ingredientMatcherService.js';
import { parseQuickAddTranscript } from '../services/phase8QuickAddParser.js';
import {
  buildWeeklyMealPlan,
  computeNutritionAndCost,
  fetchCatalogProducts,
  filterMatchesWithPantry,
  getPredictiveReorderRail,
  getUserDietaryTags,
} from '../services/phase8Services.js';

const pantrySchema = Joi.object({
  ingredient_name: Joi.string().trim().min(1).max(120).required(),
});

const quickAddSchema = Joi.object({
  transcript: Joi.string().trim().min(1).max(500).required(),
});

const plannerSchema = Joi.object({
  preferences: Joi.object({
    veg_non_veg: Joi.string().valid('veg', 'non-veg', 'any').default('any'),
    cuisine_tags: Joi.array().items(Joi.string().trim().max(40)).default([]),
  }).default({}),
  days: Joi.number().integer().min(5).max(7).default(7),
});

const profileSchema = Joi.object({
  dietary_tags: Joi.array().items(Joi.string().trim().max(40)).default([]),
});

export async function listPantry(req, res, next) {
  if (!requireFeature('smartPantry', res)) return;
  try {
    const { rows } = await pool.query(
      'SELECT id, ingredient_name, added_at FROM user_pantry WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );
    res.json({ pantry: rows });
  } catch (error) {
    next(error);
  }
}

export async function addPantryItem(req, res, next) {
  if (!requireFeature('smartPantry', res)) return;
  const { error, value } = pantrySchema.validate(req.body ?? {});
  if (error) return res.status(400).json({ error: error.message });
  try {
    const { rows } = await pool.query(
      `INSERT INTO user_pantry (user_id, ingredient_name)
       SELECT $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM user_pantry WHERE user_id = $1 AND LOWER(ingredient_name) = LOWER($2)
       )
       RETURNING id, ingredient_name, added_at`,
      [req.user.id, value.ingredient_name]
    );
    if (rows[0]) return res.json({ item: rows[0] });
    const existing = await pool.query(
      `UPDATE user_pantry SET added_at = NOW()
       WHERE user_id = $1 AND LOWER(ingredient_name) = LOWER($2)
       RETURNING id, ingredient_name, added_at`,
      [req.user.id, value.ingredient_name]
    );
    return res.json({ item: existing.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function removePantryItem(req, res, next) {
  if (!requireFeature('smartPantry', res)) return;
  try {
    await pool.query('DELETE FROM user_pantry WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function getDietaryProfile(req, res, next) {
  if (!requireFeature('dietaryFilters', res)) return;
  try {
    res.json({ dietary_tags: await getUserDietaryTags(req.user.id) });
  } catch (error) {
    next(error);
  }
}

export async function updateDietaryProfile(req, res, next) {
  if (!requireFeature('dietaryFilters', res)) return;
  const { error, value } = profileSchema.validate(req.body ?? {});
  if (error) return res.status(400).json({ error: error.message });
  try {
    const { rows } = await pool.query(
      `INSERT INTO user_dietary_profiles (user_id, dietary_tags)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET dietary_tags = EXCLUDED.dietary_tags, updated_at = NOW()
       RETURNING dietary_tags`,
      [req.user.id, value.dietary_tags]
    );
    return res.json({ dietary_tags: rows[0].dietary_tags });
  } catch (err) {
    return next(err);
  }
}

export async function planWeeklyMeals(req, res, next) {
  if (!requireFeature('weeklyMealPlanner', res)) return;
  const { error, value } = plannerSchema.validate(req.body ?? {});
  if (error) return res.status(400).json({ error: error.message });
  try {
    const plan = await buildWeeklyMealPlan({ userId: req.user.id, ...value });
    const pantryAware = await filterMatchesWithPantry(req.user.id, plan.matches);
    res.json({ ...plan, ...pantryAware });
  } catch (err) {
    next(err);
  }
}

export async function parseVoiceQuickAdd(req, res, next) {
  if (!requireFeature('voiceQuickAdd', res)) return;
  const { error, value } = quickAddSchema.validate(req.body ?? {});
  if (error) return res.status(400).json({ error: error.message });

  try {
    const parsed = parseQuickAddTranscript(value.transcript);
    const dietaryTags = await getUserDietaryTags(req.user.id);
    const products = await fetchCatalogProducts({ dietaryTags });
    const matches = matchIngredientsToProducts(
      parsed.map(item => ({
        name: item.product_name,
        qty: item.quantity,
        unit: item.unit,
      })),
      products
    );

    res.json({ parsed, matches });
  } catch (err) {
    next(err);
  }
}

export async function getNutritionCard(req, res, next) {
  if (!requireFeature('nutritionCostCard', res)) return;
  try {
    const ingredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : [];
    const matches = Array.isArray(req.body?.matches) ? req.body.matches : [];
    const servings = Number(req.body?.servings || 1);
    res.json({ nutrition: await computeNutritionAndCost(ingredients, matches, servings) });
  } catch (err) {
    next(err);
  }
}

export async function getSocialProof(req, res, next) {
  if (!requireFeature('socialProofGamification', res)) return;
  try {
    const city = req.query.city || req.user?.city || 'demo';
    const threshold = Number(req.query.threshold || 10);
    const { rows } = await pool.query(`
      SELECT COUNT(DISTINCT user_id)::int AS count
      FROM order_events
      WHERE product_id = $1
        AND city = $2
        AND event_type = 'ordered'
        AND created_at >= CURRENT_DATE
    `, [req.params.productId, city]);
    const count = rows[0]?.count || 0;
    res.json({
      count,
      visible: count >= threshold,
      message: count >= threshold ? `${count} people in your city ordered this today` : '',
    });
  } catch (err) {
    next(err);
  }
}

export async function getBadges(req, res, next) {
  if (!requireFeature('socialProofGamification', res)) return;
  try {
    const { rows } = await pool.query(
      'SELECT badge_key, label, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at DESC',
      [req.user.id]
    );
    res.json({ badges: rows });
  } catch (err) {
    next(err);
  }
}

export async function getPredictiveReorder(req, res, next) {
  if (!requireFeature('predictiveReorderFeed', res)) return;
  try {
    res.json({
      rail: await getPredictiveReorderRail(req.user.id),
      source: 'user_affinity_endpoint_plus_order_cadence',
    });
  } catch (err) {
    next(err);
  }
}
