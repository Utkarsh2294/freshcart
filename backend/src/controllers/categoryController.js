import { pool } from '../config/database.js';

export const listCategories = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
