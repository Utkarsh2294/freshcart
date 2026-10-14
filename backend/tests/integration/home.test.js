import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/database.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;
let patternedToken;
let coldToken;
let coldUserId;

beforeAll(async () => {
  if (!db()) return;

  const patterned = await request(app)
    .post('/api/auth/login')
    .send({ email: 'aditi.rao@freshcart.local', password: 'password123' });
  patternedToken = patterned.body.accessToken;

  const cold = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Cold Start',
      email: `cold-${Date.now()}@freshcart.test`,
      password: 'password123',
    });
  coldToken = cold.body.accessToken;
  coldUserId = cold.body.user?.id;
});

afterAll(async () => {
  if (coldUserId) await pool.query('DELETE FROM users WHERE id = $1', [coldUserId]);
});

describe.skipIf(!db())('Home recommendations', () => {
  it('returns a scored, in-stock banner for a patterned shopper', async () => {
    const response = await request(app)
      .get('/api/home/recommendations')
      .set('Authorization', `Bearer ${patternedToken}`)
      .expect(200);

    expect(response.body.recommendations).toHaveLength(1);
    expect(response.body.recommendations[0].confidence).toBeGreaterThanOrEqual(0.4);
    expect(response.body.recommendations[0].products.length).toBeGreaterThan(0);
  });

  it('returns an empty array for a cold-start shopper', async () => {
    const response = await request(app)
      .get('/api/home/recommendations')
      .set('Authorization', `Bearer ${coldToken}`)
      .expect(200);

    expect(response.body.recommendations).toEqual([]);
  });
});
