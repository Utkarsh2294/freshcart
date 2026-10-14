import { pool } from '../config/database.js';
import { matchIngredientsToProducts } from './ingredientMatcherService.js';
import { generateRecipe } from './kimiRecipeClient.js';

const DAY_SEEDS = [
  ['poha', 'idli', 'masala omelette'],
  ['dal tadka', 'paneer bhurji', 'veg pulao'],
  ['rajma rice', 'chicken curry', 'veg noodles'],
  ['chole', 'egg curry', 'lemon rice'],
  ['paneer butter masala', 'fish curry', 'khichdi'],
  ['veg biryani', 'chicken biryani', 'mushroom masala'],
  ['dosa', 'paratha', 'tomato rice'],
];

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function ingredientKey(item) {
  return `${normalizeText(item.name)}|${normalizeText(item.unit)}`;
}

export async function fetchCatalogProducts({ dietaryTags = [] } = {}) {
  const params = [];
  let dietaryClause = '';
  if (dietaryTags.length) {
    params.push(dietaryTags);
    dietaryClause = `AND (p.dietary_tags IS NULL OR p.dietary_tags = '{}' OR p.dietary_tags && $${params.length}::text[])`;
  }

  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.price::float AS price,
      COALESCE(p.mrp, p.price)::float AS mrp,
      p.unit,
      p.stock_qty,
      p.image_url,
      p.dietary_tags,
      c.name AS category,
      b.name AS brand,
      (p.stock_qty > 0) AS in_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.stock_qty > 0
      ${dietaryClause}
    ORDER BY p.name ASC
  `, params);
  return rows;
}

export async function getUserDietaryTags(userId) {
  const { rows } = await pool.query(
    'SELECT dietary_tags FROM user_dietary_profiles WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.dietary_tags || [];
}

export async function filterMatchesWithPantry(userId, matches) {
  const { rows } = await pool.query(
    'SELECT ingredient_name FROM user_pantry WHERE user_id = $1',
    [userId]
  );
  const pantry = new Set(rows.map(row => normalizeText(row.ingredient_name)));
  const skipped = [];
  const filtered = matches.map((match) => {
    const name = normalizeText(match.ingredient?.name);
    const inPantry = pantry.has(name);
    if (inPantry) skipped.push(match.ingredient.name);
    return inPantry
      ? { ...match, selected: false, skipped_reason: 'already_in_pantry' }
      : match;
  });

  return {
    matches: filtered,
    pantry_note: skipped.length ? `${skipped.length} items skipped - already in your pantry` : '',
    skipped,
  };
}

export async function computeNutritionAndCost(ingredients, matches, servings) {
  const names = ingredients.map(item => normalizeText(item.name));
  const { rows } = await pool.query(
    'SELECT * FROM nutrition_lookup WHERE ingredient_name = ANY($1::text[])',
    [names]
  );
  const lookup = new Map(rows.map(row => [row.ingredient_name, row]));

  let calories = 0;
  let protein = 0;
  for (const ingredient of ingredients) {
    const nutrition = lookup.get(normalizeText(ingredient.name));
    const qty = Number(ingredient.qty || 0);
    if (!nutrition || !qty) continue;
    calories += (qty / 100) * Number(nutrition.calories_per_100g);
    protein += (qty / 100) * Number(nutrition.protein_per_100g);
  }

  const cost = matches.reduce((sum, match) => (
    sum + Number(match.product?.price || 0) * Number(match.quantity || 0)
  ), 0);

  return {
    servings,
    total_calories: Math.round(calories),
    total_protein_g: Number(protein.toFixed(1)),
    calories_per_serving: Math.round(calories / Math.max(1, servings)),
    protein_g_per_serving: Number((protein / Math.max(1, servings)).toFixed(1)),
    estimated_cost: Number(cost.toFixed(2)),
    cost_per_serving: Number((cost / Math.max(1, servings)).toFixed(2)),
  };
}

export async function buildWeeklyMealPlan({ userId, preferences, days = 7 }) {
  const dietaryTags = userId ? await getUserDietaryTags(userId) : [];
  const products = await fetchCatalogProducts({ dietaryTags });
  const recipes = [];
  const merged = new Map();

  for (let day = 0; day < Math.min(7, Math.max(5, days)); day += 1) {
    const seed = DAY_SEEDS[day % DAY_SEEDS.length];
    const dish = seed[(day + (preferences?.cuisine_tags?.length || 0)) % seed.length];
    const recipe = await generateRecipe(`${preferences?.veg_non_veg || ''} ${preferences?.cuisine_tags?.join(' ') || ''} ${dish}`.trim(), 2);
    recipes.push({ day: day + 1, dish_name: dish, ...recipe });

    for (const ingredient of recipe.ingredients || []) {
      const key = ingredientKey(ingredient);
      const current = merged.get(key) || { ...ingredient, qty: 0 };
      current.qty += Number(ingredient.qty || 0);
      merged.set(key, current);
    }
  }

  const consolidatedIngredients = [...merged.values()];
  const matches = matchIngredientsToProducts(consolidatedIngredients, products);
  return { recipes, consolidated_ingredients: consolidatedIngredients, matches };
}

export async function getPredictiveReorderRail(userId) {
  const { rows } = await pool.query(`
    WITH purchases AS (
      SELECT
        p.id,
        p.name,
        p.price::float AS price,
        COALESCE(p.mrp, p.price)::float AS mrp,
        p.unit,
        p.image_url,
        c.name AS category,
        b.name AS brand,
        o.created_at,
        LAG(o.created_at) OVER (PARTITION BY p.id ORDER BY o.created_at) AS previous_at
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE o.user_id = $1
    ),
    cadence AS (
      SELECT
        id, name, price, mrp, unit, image_url, category, brand,
        MAX(created_at) AS last_ordered_at,
        AVG(EXTRACT(EPOCH FROM (created_at - previous_at)) / 86400.0) AS avg_days_between,
        COUNT(*)::int AS purchase_count
      FROM purchases
      GROUP BY id, name, price, mrp, unit, image_url, category, brand
    )
    SELECT *
    FROM cadence
    WHERE purchase_count >= 2
    ORDER BY
      ABS(EXTRACT(EPOCH FROM (NOW() - last_ordered_at)) / 86400.0 - COALESCE(avg_days_between, 7)) ASC,
      purchase_count DESC
    LIMIT 6
  `, [userId]);

  return rows.map(row => ({
    ...row,
    reason: row.avg_days_between
      ? `Usually every ${Math.max(1, Math.round(row.avg_days_between))} days`
      : 'A frequent repeat from your orders',
  }));
}
