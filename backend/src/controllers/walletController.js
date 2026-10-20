import { pool } from "../config/database.js";

export const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const balanceResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as balance FROM wallet_transactions WHERE user_id = $1",
      [userId],
    );
    const balance = Number(balanceResult.rows[0].balance);

    const txResult = await pool.query(
      "SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );

    res.json({
      balance,
      transactions: txResult.rows,
    });
  } catch (error) {
    next(error);
  }
};
