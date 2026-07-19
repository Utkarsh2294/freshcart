import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
