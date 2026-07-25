import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

describe.skipIf(!db())('Search API', () => {
  it('GET /api/products — returns array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/products?search=milk — returns results', async () => {
    const res = await request(app).get('/api/products?search=milk');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/products?search=bananna — typo tolerance returns array', async () => {
    const res = await request(app).get('/api/products?search=bananna');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // pg_trgm typo tolerance: may return results for banana, always returns an array
  });

  it('GET /api/search/suggest?q=milk — returns suggestions', async () => {
    const res = await request(app).get('/api/search/suggest?q=milk');
    expect([200, 429]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});
