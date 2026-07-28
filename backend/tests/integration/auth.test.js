import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

describe.skipIf(!db())('Auth API', () => {
  it('POST /api/auth/register rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'bad-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@freshcart.local', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login returns tokens for seeded customer', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@freshcart.local', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
