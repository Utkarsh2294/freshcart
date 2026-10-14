import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/database.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;
const users = [];
let referrerToken;
let referredToken;

async function register(label) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: label,
      email: `${label.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${Math.random()}@freshcart.test`,
      password: 'password123',
    });
  users.push(response.body.user.id);
  return response.body.accessToken;
}

beforeAll(async () => {
  if (!db()) return;
  referrerToken = await register('Phase Eight Referrer');
  referredToken = await register('Phase Eight Referred');
});

afterAll(async () => {
  if (users.length) await pool.query('DELETE FROM users WHERE id = ANY($1::int[])', [users]);
});

describe.skipIf(!db())('Phase 8 modules', () => {
  it('manages pantry and dietary profile without duplicates', async () => {
    await request(app)
      .post('/api/phase8/pantry')
      .set('Authorization', `Bearer ${referredToken}`)
      .send({ ingredient_name: 'Milk' })
      .expect(200);
    await request(app)
      .post('/api/phase8/pantry')
      .set('Authorization', `Bearer ${referredToken}`)
      .send({ ingredient_name: 'milk' })
      .expect(200);

    const pantry = await request(app)
      .get('/api/phase8/pantry')
      .set('Authorization', `Bearer ${referredToken}`)
      .expect(200);
    expect(pantry.body.pantry).toHaveLength(1);

    await request(app)
      .put('/api/phase8/dietary-profile')
      .set('Authorization', `Bearer ${referredToken}`)
      .send({ dietary_tags: ['vegan', 'gluten-free'] })
      .expect(200);
    const profile = await request(app)
      .get('/api/phase8/dietary-profile')
      .set('Authorization', `Bearer ${referredToken}`)
      .expect(200);
    expect(profile.body.dietary_tags).toEqual(['vegan', 'gluten-free']);
  });

  it('parses voice quick-add and accepts its cart source', async () => {
    const parsed = await request(app)
      .post('/api/phase8/voice-quick-add/parse')
      .set('Authorization', `Bearer ${referrerToken}`)
      .send({ transcript: 'add two litres of milk and a loaf of bread' })
      .expect(200);
    expect(parsed.body.parsed.map(item => item.product_name)).toEqual(['milk', 'bread']);

    const product = parsed.body.matches.find(match => match.product)?.product;
    expect(product).toBeTruthy();
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${referrerToken}`)
      .send({ product_id: product.id, quantity: 1, source: 'voice_quick_add' })
      .expect(200);
  });

  it('persists notification preferences without VAPID credentials', async () => {
    const response = await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${referredToken}`)
      .send({ order_status: true, back_in_stock: false, price_drop: true })
      .expect(200);
    expect(response.body.preferences).toEqual({
      order_status: true,
      back_in_stock: false,
      price_drop: true,
    });
  });

  it('credits both referral wallets exactly once and rejects repeats', async () => {
    const codeResponse = await request(app)
      .get('/api/referral/my-code')
      .set('Authorization', `Bearer ${referrerToken}`)
      .expect(200);
    const code = codeResponse.body.code;

    await request(app)
      .post('/api/referral/redeem')
      .set('Authorization', `Bearer ${referredToken}`)
      .send({ code: code.toLowerCase() })
      .expect(200);

    const [referrerWallet, referredWallet] = await Promise.all([
      request(app).get('/api/wallet').set('Authorization', `Bearer ${referrerToken}`),
      request(app).get('/api/wallet').set('Authorization', `Bearer ${referredToken}`),
    ]);
    expect(referrerWallet.body.balance).toBe(50);
    expect(referredWallet.body.balance).toBe(50);

    await request(app)
      .post('/api/referral/redeem')
      .set('Authorization', `Bearer ${referredToken}`)
      .send({ code })
      .expect(400);
    const unchanged = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${referredToken}`)
      .expect(200);
    expect(unchanged.body.balance).toBe(50);
  });
});
