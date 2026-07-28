import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:4000/api';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://freshcart:freshcart_pass@localhost:5433/freshcart';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

try {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  const dbCount = rows[0].count;
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error(`API returned ${response.status}`);

  const body = await response.json();
  const apiCount = Array.isArray(body.data) ? body.data.length : 0;
  if (apiCount !== dbCount) {
    console.error(`Catalog parity failed: DB=${dbCount}, API=${apiCount}`);
    process.exitCode = 1;
  } else {
    console.log(`Catalog parity OK: DB=${dbCount}, API=${apiCount}`);
  }
} catch (error) {
  console.error(`Catalog parity check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
