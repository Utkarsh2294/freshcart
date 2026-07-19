import { pool } from '../config/database.js';

export const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, review_text } = req.body;

    const result = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, rating, review_text || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
