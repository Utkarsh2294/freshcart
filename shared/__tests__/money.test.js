import { describe, it, expect } from 'vitest';
import { toPaise, toRupees, add, subtract, multiply, applyPercentage, roundToNearestPaise, formatINR } from 'freshcart-shared/money';

describe('money.js', () => {
  describe('toPaise', () => {
    it('converts rupee number to paise', () => {
      expect(toPaise(99.50)).toBe(9950);
      expect(toPaise(0.01)).toBe(1);
      expect(toPaise(100)).toBe(10000);
    });

    it('converts rupee string to paise', () => {
      expect(toPaise('49.99')).toBe(4999);
    });

    it('throws on invalid input', () => {
      expect(() => toPaise('abc')).toThrow('Invalid money value');
    });
  });

  describe('toRupees', () => {
    it('converts paise to rupees', () => {
      expect(toRupees(9950)).toBe(99.50);
      expect(toRupees(1)).toBe(0.01);
      expect(toRupees(10000)).toBe(100);
    });
  });

  describe('add', () => {
    it('adds two amounts correctly', () => {
      expect(add(10.10, 20.20)).toBe(30.30);
      expect(add(0.1, 0.2)).toBe(0.30);
    });

    it('avoids floating point issues', () => {
      // Classic JS: 0.1 + 0.2 = 0.30000000000000004
      expect(add(0.1, 0.2)).toBe(0.3);
    });
  });

  describe('subtract', () => {
    it('subtracts correctly', () => {
      expect(subtract(100, 30.50)).toBe(69.50);
    });
  });

  describe('multiply', () => {
    it('multiplies correctly', () => {
      expect(multiply(10, 3)).toBe(30);
      expect(multiply(99.99, 2)).toBe(199.98);
    });
  });

  describe('applyPercentage', () => {
    it('applies percentage correctly', () => {
      expect(applyPercentage(200, 10)).toBe(20);
      expect(applyPercentage(99.99, 50)).toBe(50);
    });
  });

  describe('roundToNearestPaise', () => {
    it('rounds to nearest paise', () => {
      expect(roundToNearestPaise(10.555)).toBe(10.56);
      expect(roundToNearestPaise(10.554)).toBe(10.55);
    });
  });

  describe('formatINR', () => {
    it('formats with Indian currency symbol', () => {
      const formatted = formatINR(1234.50);
      expect(formatted).toContain('1,234.50');
    });
  });
});
