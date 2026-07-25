/**
 * controllers/cookThisController.js
 *
 * Handles POST /ai/cook-this/generate. Cache-first: checks recipe_cache
 * before ever calling kimiRecipeClient. Returns the same response shape
 * regardless of cache hit or miss — the frontend never needs to know which
 * path it took.
 *
 * ASSUMPTIONS (adjust to match your actual project structure):
 *   - `../db/pool` exports a node-postgres Pool (or equivalent `.query()`)
 *   - Express is the web framework
 *   - Auth is handled by upstream middleware (see routes/cookThisRoutes.js)
 */

import Joi from 'joi';
import { generateRecipe, RecipeGenerationError } from '../services/kimiRecipeClient.js';
import { pool } from '../config/database.js';
import { matchIngredientsToProducts } from '../services/ingredientMatcherService.js';
import { featureFlags } from '../config/featureFlags.js';
import {
  computeNutritionAndCost,
  fetchCatalogProducts as fetchPhase8CatalogProducts,
  filterMatchesWithPantry,
  getUserDietaryTags,
} from '../services/phase8Services.js';

const requestSchema = Joi.object({
  dish_name: Joi.string().trim().min(1).max(200).required(),
  servings: Joi.number().integer().min(1).max(50).required(),
}).required();

const matchRequestSchema = Joi.object({
  ingredients: Joi.array().items(Joi.object({
    name: Joi.string().trim().min(1).required(),
    qty: Joi.number().positive().required(),
    unit: Joi.string().allow('', null).default(null),
  })).min(1).required(),
  servings: Joi.number().integer().min(1).max(50).optional(),
}).required();

const addMatchedItemsSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).max(50).required(),
  })).min(1).required(),
}).required();

/** Trim, lowercase, collapse internal whitespace — the cache key shape. */
function normalizeDishName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function findCachedRecipe(dishName, servings) {
  const { rows } = await pool.query(
    `SELECT title, steps, ingredients, nutrition, estimated_cost
       FROM recipe_cache
      WHERE dish_name = $1 AND servings = $2
      LIMIT 1`,
    [dishName, servings]
  );
  return rows[0] || null;
}

async function cacheRecipe(dishName, servings, recipe) {
  // ON CONFLICT DO NOTHING: if two requests race for the same
  // (dish_name, servings) before either finishes, we don't error —
  // whichever inserts first wins, the other's response is still returned
  // to its own caller correctly (just not persisted twice).
  await pool.query(
    `INSERT INTO recipe_cache (dish_name, servings, title, steps, ingredients, source)
     VALUES ($1, $2, $3, $4, $5, 'kimi_api')
     ON CONFLICT (dish_name, servings) DO NOTHING`,
    [
      dishName,
      servings,
      recipe.title,
      JSON.stringify(recipe.steps),
      JSON.stringify(recipe.ingredients),
    ]
  );
}

async function generateRecipeHandler(req, res) {
  const { error, value } = requestSchema.validate(req.body ?? {});
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const { dish_name: rawDishName, servings } = value;
  const dishName = normalizeDishName(rawDishName);

  try {
    const cached = await findCachedRecipe(dishName, servings);
    if (cached) {
      return res.status(200).json({
        title: cached.title,
        steps: cached.steps,
        ingredients: cached.ingredients,
        nutrition: cached.nutrition || null,
        source: 'cache',
      });
    }

    const recipe = await generateRecipe(dishName, servings);
    await cacheRecipe(dishName, servings, recipe);

    return res.status(200).json({
      title: recipe.title,
      steps: recipe.steps,
      ingredients: recipe.ingredients,
      source: 'kimi_api',
    });
  } catch (err) {
    if (err instanceof RecipeGenerationError) {
      console.error('[POST /ai/cook-this/generate] Graceful failure cause:', err.cause || err.message);
      // Graceful failure state — never a silent crash, never an empty cart.
      return res.status(422).json({
        success: false,
        error: 'recipe_generation_failed',
        message: "Couldn't generate that recipe — try rephrasing the dish name.",
      });
    }

    // Anything else (DB unreachable, etc.) - still respond cleanly.
    console.error('[POST /ai/cook-this/generate] unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: "Couldn't generate that recipe — try again in a moment.",
    });
  }
}

async function fetchCatalogProducts() {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.price::float AS price,
      COALESCE(p.mrp, p.price)::float AS mrp,
      p.unit,
      p.stock_qty,
      p.image_url,
      c.name AS category,
      b.name AS brand,
      (p.stock_qty > 0) AS in_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.stock_qty > 0
    ORDER BY p.name ASC
  `);
  return rows;
}

async function matchIngredientsHandler(req, res, next) {
  const { error, value } = matchRequestSchema.validate(req.body ?? {});
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  try {
    const dietaryTags = featureFlags.dietaryFilters && req.user?.id
      ? await getUserDietaryTags(req.user.id)
      : [];
    const products = dietaryTags.length
      ? await fetchPhase8CatalogProducts({ dietaryTags })
      : await fetchCatalogProducts();
    const matches = matchIngredientsToProducts(value.ingredients, products);
    const pantryResult = featureFlags.smartPantry && req.user?.id
      ? await filterMatchesWithPantry(req.user.id, matches)
      : { matches, pantry_note: '', skipped: [] };
    const nutrition = featureFlags.nutritionCostCard
      ? await computeNutritionAndCost(value.ingredients, pantryResult.matches, Number(value.servings || 1))
      : null;

    return res.json({
      ...pantryResult,
      nutrition,
      dietary_tags_applied: dietaryTags,
    });
  } catch (err) {
    return next(err);
  }
}

async function addMatchedItemsHandler(req, res, next) {
  const { error, value } = addMatchedItemsSchema.validate(req.body ?? {});
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  try {
    const userId = req.user.id;
    let cartResult = await pool.query("SELECT id FROM carts WHERE user_id = $1 AND status = 'active'", [userId]);
    if (cartResult.rows.length === 0) {
      cartResult = await pool.query("INSERT INTO carts (user_id, status) VALUES ($1, 'active') RETURNING id", [userId]);
    }
    const cartId = cartResult.rows[0].id;

    for (const item of value.items) {
      const existing = await pool.query(
        'SELECT id, qty FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, item.product_id]
      );

      if (existing.rows.length) {
        await pool.query(
          'UPDATE cart_items SET qty = $1, source = $2 WHERE id = $3',
          [existing.rows[0].qty + item.quantity, 'ai_recipe', existing.rows[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, qty, source) VALUES ($1, $2, $3, $4)',
          [cartId, item.product_id, item.quantity, 'ai_recipe']
        );
      }
    }

    if (featureFlags.socialProofGamification) {
      await pool.query(`
        INSERT INTO ai_recipe_activity (user_id, activity_date, recipes_generated)
        VALUES ($1, CURRENT_DATE, 1)
        ON CONFLICT (user_id, activity_date)
        DO UPDATE SET recipes_generated = ai_recipe_activity.recipes_generated + 1
      `, [userId]);

      await pool.query(`
        INSERT INTO badges (user_id, badge_key, label)
        SELECT $1, 'ai_recipe_3_day', '3-day AI recipe streak'
        WHERE (
          SELECT COUNT(*) FROM ai_recipe_activity
          WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '2 days'
        ) >= 3
        ON CONFLICT DO NOTHING
      `, [userId]);
    }

    return res.json({ success: true, added: value.items.length });
  } catch (err) {
    return next(err);
  }
}

export { addMatchedItemsHandler, generateRecipeHandler, matchIngredientsHandler, normalizeDishName };
