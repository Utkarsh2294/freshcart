import { describe, expect, it } from 'vitest';
import { matchIngredientsToProducts } from '../../src/services/ingredientMatcherService.js';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Amul Paneer', brand: 'Amul', category: 'Dairy & Eggs', price: 90, unit: '200g', stock_qty: 50 },
  { id: 2, name: 'Tomato Puree', brand: 'Kissan', category: 'Condiments', price: 45, unit: '200ml', stock_qty: 30 },
  { id: 3, name: 'Amul Butter', brand: 'Amul', category: 'Dairy & Eggs', price: 55, unit: '100g', stock_qty: 40 },
  { id: 4, name: 'Fresh Cream', brand: 'Amul', category: 'Dairy & Eggs', price: 40, unit: '100ml', stock_qty: 20 },
  { id: 5, name: 'Garam Masala', brand: 'MDH', category: 'Spices', price: 80, unit: '100g', stock_qty: 60 },
];

describe('matchIngredientsToProducts', () => {
  it('matches paneer to Amul Paneer (exact)', () => {
    const result = matchIngredientsToProducts(
      [{ name: 'paneer', qty: 200, unit: 'g' }],
      MOCK_PRODUCTS
    );
    expect(result[0].selected).toBe(true);
    expect(result[0].product.id).toBe(1);
    expect(result[0].match_type).toMatch(/exact|multi_pack|oversized|closest/);
  });

  it('returns no_match for unrecognized ingredient', () => {
    const result = matchIngredientsToProducts(
      [{ name: 'unicorn tears', qty: 1, unit: 'ml' }],
      MOCK_PRODUCTS
    );
    expect(result[0].selected).toBe(false);
    expect(result[0].match_type).toBe('no_match');
  });

  it('provides alternatives for matched ingredients', () => {
    const result = matchIngredientsToProducts(
      [{ name: 'butter', qty: 50, unit: 'g' }],
      MOCK_PRODUCTS
    );
    expect(result[0].selected).toBe(true);
    expect(Array.isArray(result[0].alternatives)).toBe(true);
  });

  it('selects correct pack quantity for 200g paneer in 200g pack', () => {
    const result = matchIngredientsToProducts(
      [{ name: 'paneer', qty: 200, unit: 'g' }],
      MOCK_PRODUCTS
    );
    // 200g needed, 200g pack -> quantity should be 1
    expect(result[0].quantity).toBe(1);
  });

  it('handles multiple ingredients', () => {
    const result = matchIngredientsToProducts(
      [
        { name: 'paneer', qty: 200, unit: 'g' },
        { name: 'butter', qty: 50, unit: 'g' },
        { name: 'cream', qty: 100, unit: 'ml' },
      ],
      MOCK_PRODUCTS
    );
    expect(result).toHaveLength(3);
    expect(result.filter(r => r.selected).length).toBeGreaterThanOrEqual(1);
  });
});
