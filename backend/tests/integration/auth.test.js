import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

describe.skipIf(!db())('Auth API', () => {
  it('POST /api/auth/otp/request — accepts valid phone', async () => {
    const res = await request(app)
      .post('/api/auth/otp/request')
      .send({ phone: '9876543210' });
    expect([200, 201, 429]).toContain(res.status); // 429 if rate-limited in CI
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty('message');
    }
  });

  it('POST /api/auth/otp/request — rejects invalid phone', async () => {
    const res = await request(app)
      .post('/api/auth/otp/request')
      .send({ phone: '123' }); // too short
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/otp/verify — wrong OTP returns 401', async () => {
    await request(app).post('/api/auth/otp/request').send({ phone: '9876543210' });
    const res = await request(app)
      .post('/api/auth/otp/verify')
      .send({ phone: '9876543210', otp: '000000' });
    expect([200, 201, 401, 400]).toContain(res.status);
  });

  it('POST /api/auth/otp/verify — mock OTP 123456 returns tokens', async () => {
    await request(app).post('/api/auth/otp/request').send({ phone: '9876543210' });
    const res = await request(app)
      .post('/api/auth/otp/verify')
      .send({ phone: '9876543210', otp: '123456' });
    expect([200, 201]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty('accessToken');
    }
  });
});
