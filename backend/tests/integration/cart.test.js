import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/database.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

let token;
let swapToken;
let swapUserId;

beforeAll(async () => {
  if (!db()) return;
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'customer@freshcart.local', password: 'password123' });
  token = res.body?.accessToken;

  const registration = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Swap Test',
      email: `swap-${Date.now()}@freshcart.test`,
      password: 'password123',
    });
  swapToken = registration.body?.accessToken;
  swapUserId = registration.body?.user?.id;
});

afterAll(async () => {
  if (swapUserId) await pool.query('DELETE FROM users WHERE id = $1', [swapUserId]);
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

  it('swaps atomically and preserves an AI-recipe source', async () => {
    const { rows } = await pool.query(`
      SELECT p.id
      FROM products p
      WHERE p.stock_qty > 0
        AND (
          SELECT COUNT(*) FROM products alternative
          WHERE alternative.category_id = p.category_id
            AND alternative.stock_qty > 0
            AND alternative.id <> p.id
        ) >= 2
      LIMIT 1
    `);
    expect(rows.length).toBe(1);

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${swapToken}`)
      .send({ product_id: rows[0].id, quantity: 2, source: 'ai_recipe' })
      .expect(200);

    const cart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${swapToken}`)
      .expect(200);
    const item = cart.body.cart.items[0];

    const optionResponse = await request(app)
      .get(`/api/cart/items/${item.id}/swap-options`)
      .set('Authorization', `Bearer ${swapToken}`)
      .expect(200);
    expect(optionResponse.body.options.length).toBeGreaterThan(0);
    expect(optionResponse.body.options[0].product_id).not.toBe(item.product_id);

    const swapped = await request(app)
      .patch(`/api/cart/items/${item.id}/swap`)
      .set('Authorization', `Bearer ${swapToken}`)
      .send({ new_product_id: optionResponse.body.options[0].product_id })
      .expect(200);
    expect(swapped.body.preserved_source).toBe('ai_recipe');

    const finalCart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${swapToken}`)
      .expect(200);
    expect(finalCart.body.cart.items[0]).toMatchObject({ quantity: 2, source: 'ai_recipe' });
    expect(finalCart.body.cart.items[0].product_id).toBe(optionResponse.body.options[0].product_id);
  });
});
