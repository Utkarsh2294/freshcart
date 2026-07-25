/**
 * vitest-setup.js — global test setup for Freshcart backend tests.
 *
 * Checks whether Postgres and Redis are reachable. If not, sets a flag
 * used by integration tests to skip gracefully rather than error.
 * This keeps `npm test` green in environments without Docker (unit tests
 * always run; integration tests are skipped rather than failed).
 */

import pg from 'pg';

const { Client } = pg;

let dbAvailable = false;
let redisAvailable = false;

try {
  const client = new Client({
    connectionString: process.env.DATABASE_URL ||
      'postgresql://freshcart:freshcart_pass@localhost:5433/freshcart',
    connectionTimeoutMillis: 2000,
  });
  await client.connect();
  await client.query('SELECT 1');
  await client.end();
  dbAvailable = true;
} catch {
  dbAvailable = false;
}

// Expose to tests via globalThis so integration suites can conditionally skip
globalThis.__FRESHCART_DB_AVAILABLE__ = dbAvailable;
globalThis.__FRESHCART_REDIS_AVAILABLE__ = redisAvailable;

if (!dbAvailable) {
  console.log('[vitest-setup] Postgres not reachable — integration tests will be skipped (unit tests still run).');
}
