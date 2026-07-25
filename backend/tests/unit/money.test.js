import { describe, expect, it } from 'vitest';
import {
  toPaise,
  toRupees,
  add,
  subtract,
  applyPercentage,
  formatINR,
} from '../../../node_modules/freshcart-shared/money.js';

describe('money — toPaise / toRupees', () => {
  it('toPaise converts rupees to integer paise', () => {
    expect(toPaise(99.50)).toBe(9950);
    expect(toPaise('12.34')).toBe(1234);
    expect(toPaise(0)).toBe(0);
    expect(toPaise(1)).toBe(100);
  });

  it('toRupees converts paise back to rupees', () => {
    expect(toRupees(9950)).toBe(99.50);
    expect(toRupees(1234)).toBe(12.34);
    expect(toRupees(0)).toBe(0);
  });

  it('add and subtract avoid floating-point bugs', () => {
    // Classic JS float bug: 0.1 + 0.2 !== 0.3 — paise math fixes this
    expect(add(0.1, 0.2)).toBe(0.30);
    expect(subtract(10.50, 5.25)).toBe(5.25);
    expect(add(99.99, 0.01)).toBe(100.00);
  });

  it('applyPercentage — 50% wallet cap business rule', () => {
    // Business rule from README: wallet may cover at most 50% of order value
    expect(applyPercentage(500, 50)).toBe(250);   // 50% of ₹500 = ₹250
    expect(applyPercentage(100, 50)).toBe(50);    // 50% of ₹100 = ₹50
    expect(applyPercentage(0, 50)).toBe(0);

    // Simulated checkout: balance=400, subtotal=500 → cap=250 → applied=250
    const balance = 400;
    const subtotal = 500;
    const cap = applyPercentage(subtotal, 50);
    const applied = Math.min(balance, cap);
    expect(cap).toBe(250);
    expect(applied).toBe(250);
  });
});
