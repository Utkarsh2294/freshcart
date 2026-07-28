import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

let token;

beforeAll(async () => {
  if (!db()) return;
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'customer@freshcart.local', password: 'password123' });
  token = res.body?.accessToken;
});

describe.skipIf(!db())('Cart API', () => {
  it('GET /api/cart returns 401 without token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('GET /api/cart returns cart when authenticated', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cart');
    expect(res.body.cart).toHaveProperty('items');
    expect(Array.isArray(res.body.cart.items)).toBe(true);
  });

  it('POST /api/cart/items rejects missing product_id', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ qty: 1 });
    expect([400, 422]).toContain(res.status);
  });
});
