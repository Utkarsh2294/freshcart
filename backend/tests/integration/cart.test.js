import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

let token;

beforeAll(async () => {
  if (!db()) return;
  await request(app).post('/api/auth/otp/request').send({ phone: '9876543210' });
  const res = await request(app)
    .post('/api/auth/otp/verify')
    .send({ phone: '9876543210', otp: '123456' });
  token = res.body?.accessToken;
});

describe.skipIf(!db())('Cart API', () => {
  it('GET /api/cart — 401 without token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('GET /api/cart — returns cart when authenticated', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('POST /api/cart/items — rejects missing product_id', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ qty: 1 });
    expect([400, 422]).toContain(res.status);
  });
});
