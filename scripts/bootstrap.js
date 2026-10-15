import { spawnSync } from "node:child_process";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://freshcart:freshcart_pass@localhost:5433/freshcart";
const pool = new pg.Pool({ connectionString });

try {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM products",
  );
  if (rows[0].count === 0) {
    const result = spawnSync(process.execPath, ["scripts/seed.js"], {
      env: process.env,
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status || 1);
  }
} finally {
  await pool.end();
}
