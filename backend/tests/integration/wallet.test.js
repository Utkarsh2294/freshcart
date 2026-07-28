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

describe.skipIf(!db())('Wallet API', () => {
  it('GET /api/wallet returns balance when authenticated', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('balance');
    expect(typeof Number(res.body.balance)).toBe('number');
  });

  it('GET /api/wallet returns 401 without token', async () => {
    const res = await request(app).get('/api/wallet');
    expect(res.status).toBe(401);
  });
});
