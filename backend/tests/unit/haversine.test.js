import { describe, expect, it } from 'vitest';

// Inline the haversine function (same as orderController.js) for isolated testing
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180)
    * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(12.9352, 77.6245, 12.9352, 77.6245)).toBeCloseTo(0, 5);
  });

  it('Koramangala to Indiranagar is roughly 5 km', () => {
    // Koramangala Hub: 12.9352, 77.6245  Indiranagar Hub: 12.9784, 77.6408
    const dist = haversineKm(12.9352, 77.6245, 12.9784, 77.6408);
    expect(dist).toBeGreaterThan(4.0);
    expect(dist).toBeLessThan(7.0);
  });

  it('Koramangala to HSR Layout is roughly 3-5 km', () => {
    // HSR Layout Hub: 12.9121, 77.6446
    const dist = haversineKm(12.9352, 77.6245, 12.9121, 77.6446);
    expect(dist).toBeGreaterThan(2.0);
    expect(dist).toBeLessThan(6.0);
  });

  it('is symmetric (A->B == B->A)', () => {
    const d1 = haversineKm(12.9352, 77.6245, 12.9784, 77.6408);
    const d2 = haversineKm(12.9784, 77.6408, 12.9352, 77.6245);
    expect(d1).toBeCloseTo(d2, 10);
  });
});
