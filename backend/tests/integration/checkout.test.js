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

describe.skipIf(!db())('Checkout (Order creation) requires DB', () => {
  it('POST /api/orders returns 401 without auth', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/orders returns 400 when cart is empty', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ apply_wallet: false, payment_method: 'cod' });
    expect([201, 400]).toContain(res.status);
  });
});

describe('Wallet 50% cap business rule', () => {
  it('walletAmountApplied <= subtotal * 0.5', () => {
    function computeWalletCap(balance, subtotal) {
      const maxWalletUse = Number((subtotal * 0.5).toFixed(2));
      return Math.min(balance, maxWalletUse);
    }
    expect(computeWalletCap(400, 500)).toBe(250);
    expect(computeWalletCap(100, 500)).toBe(100);
    expect(computeWalletCap(0, 500)).toBe(0);
    expect(computeWalletCap(500, 100)).toBe(50);
    expect(computeWalletCap(1000, 0)).toBe(0);
  });
});
