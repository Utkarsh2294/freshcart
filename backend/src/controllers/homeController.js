import { pool } from '../config/database.js';
import { URL } from 'url';

const PRAMARSHA_TIMEOUT_MS = Number(process.env.PRAMARSHA_TIMEOUT_MS || 350);

function headlineForReason(reasonTag) {
  const labels = {
    sunday_staples: 'Your Sunday staples are ready',
    weekday_breakfast: 'Breakfast basics for right now',
    evening_snacks: 'Evening snack picks are waiting',
    dairy_restock: 'Time to restock your dairy shelf',
    monthly_staples: 'Monthly staples you usually pick now',
  };
  return labels[reasonTag] || 'Your usual picks are ready';
}

function normalizeRecommendation(result) {
  const items = Array.isArray(result) ? result : result?.recommendations || result?.items || [];
  const first = items[0] || result;
  const products = first?.products || first?.items || [];

  if (!products.length) return [];

  const reasonTag = first.reason_tag || first.reasonTag || 'right_now';
  return [{
    reason_tag: reasonTag,
    headline: first.headline || headlineForReason(reasonTag),
    products: products.slice(0, 3).map(product => ({
      id: product.id || product.product_id,
      product_id: product.product_id || product.id,
      name: product.name,
      brand: product.brand,
      price: Number(product.price || 0),
      mrp: Number(product.mrp || product.price || 0),
      unit: product.unit,
      image_url: product.image_url || product.imageUrl || '',
      category: product.category || '',
    })),
  }];
}

async function fetchPramarshaRecommendations(userId) {
  const baseUrl = process.env.PRAMARSHA_API_URL;
  if (!baseUrl) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRAMARSHA_TIMEOUT_MS);

  try {
    const url = new URL('/home/recommendations', baseUrl);
    url.searchParams.set('user_id', userId);
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return [];
    return normalizeRecommendation(await response.json());
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLocalTemporalFallback(userId) {
  const orderStats = await pool.query(`
    SELECT COUNT(*)::int AS order_count
    FROM orders
    WHERE user_id = $1
  `, [userId]);

  if (orderStats.rows[0].order_count < 2) {
    return [];
  }

  const categoryResult = await pool.query(`
    SELECT p.category_id, c.name AS category_name, COUNT(*)::int AS purchase_count
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE o.user_id = $1
    GROUP BY p.category_id, c.name
    ORDER BY purchase_count DESC, c.name ASC
    LIMIT 1
  `, [userId]);

  if (!categoryResult.rows.length) return [];

  const category = categoryResult.rows[0];
  const productResult = await pool.query(`
    SELECT
      p.id,
      p.id AS product_id,
      p.name,
      p.price::float AS price,
      COALESCE(p.mrp, p.price)::float AS mrp,
      p.unit,
      p.image_url,
      c.name AS category,
      b.name AS brand,
      COALESCE(ps.final_score, 0.55)::float AS final_score
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_scores ps ON ps.product_id = p.id
    WHERE p.category_id = $1
      AND p.stock_qty > 0
    ORDER BY COALESCE(ps.final_score, 0.55) DESC, p.stock_qty DESC, p.name ASC
    LIMIT 3
  `, [category.category_id]);

  if (!productResult.rows.length) return [];

  const hour = new Date().getHours();
  const reasonTag = hour < 12
    ? 'weekday_breakfast'
    : hour < 18
      ? 'monthly_staples'
      : 'evening_snacks';

  return [{
    reason_tag: reasonTag,
    headline: headlineForReason(reasonTag),
    products: productResult.rows,
    category: category.category_name,
  }];
}

export const getHomeRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const external = await fetchPramarshaRecommendations(userId);
    const recommendations = external.length ? external : await fetchLocalTemporalFallback(userId);

    res.json({
      recommendations,
      source: external.length ? 'pramarsha' : 'local_temporal_fallback',
    });
  } catch (error) {
    next(error);
  }
};
