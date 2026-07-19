import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const suggest = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters long' });
    }

    const queryText = q.trim();
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        userId = decoded.id;
      } catch {
        userId = null;
      }
    }

    let query = '';
    let params = [];

    if (userId) {
      query = `
        WITH user_purchases AS (
          SELECT DISTINCT p.id AS product_id, p.name, c.name AS category, 1.0 AS weight
          FROM products p
          JOIN categories c ON p.category_id = c.id
          JOIN order_items oi ON p.id = oi.product_id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.user_id = $1 AND p.name ILIKE $2
          LIMIT 3
        ),
        general_matches AS (
          SELECT p.id AS product_id, p.name, c.name AS category, similarity(p.name, $3) AS weight
          FROM products p
          JOIN categories c ON p.category_id = c.id
          WHERE p.name ILIKE $2 OR similarity(p.name, $3) > 0.2
          LIMIT 10
        )
        SELECT product_id, name, category, MAX(weight) AS max_weight
        FROM (
          SELECT * FROM user_purchases
          UNION ALL
          SELECT * FROM general_matches
        ) combined
        GROUP BY product_id, name, category
        ORDER BY max_weight DESC, name ASC
        LIMIT 6;
      `;
      params = [userId, `%${queryText}%`, queryText];
    } else {
      query = `
        SELECT p.id AS product_id, p.name, c.name AS category, similarity(p.name, $1) AS weight
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.name ILIKE $2 OR similarity(p.name, $1) > 0.2
        ORDER BY weight DESC, p.name ASC
        LIMIT 6;
      `;
      params = [queryText, `%${queryText}%`];
    }

    const result = await pool.query(query, params);
    res.json(result.rows.map(row => ({
      id: row.product_id,
      name: row.name,
      category: row.category,
    })));
  } catch (error) {
    next(error);
  }
};
