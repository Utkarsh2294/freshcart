import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://freshcart:freshcart_pass@localhost:5433/freshcart';
const pool = new pg.Pool({ connectionString: DATABASE_URL });

try {
  const { rows: [counts] } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS products,
      (SELECT COUNT(*)::int FROM product_scores) AS product_scores,
      (SELECT COUNT(*)::int FROM users WHERE email LIKE 'demo.user.%@freshcart.local') AS synthetic_users,
      (SELECT COUNT(*)::int FROM user_category_cadence) AS cadence_rows
  `);

  const failures = [];
  if (counts.products < 500) failures.push(`catalog has ${counts.products} products; expected at least 500`);
  if (counts.synthetic_users < 150) failures.push(`dataset has ${counts.synthetic_users} synthetic users; expected at least 150`);
  if (counts.product_scores !== counts.products) failures.push(`product_scores=${counts.product_scores} does not cover products=${counts.products}`);
  if (counts.cadence_rows === 0) failures.push('Pramarsha cadence table is empty; run npm run jobs:pramarsha');

  if (failures.length) throw new Error(failures.join('; '));
  console.log(`Phase 7 data OK: products=${counts.products}, synthetic_users=${counts.synthetic_users}, scores=${counts.product_scores}, cadence_rows=${counts.cadence_rows}`);
} finally {
  await pool.end();
}
