import { describe, expect, it } from 'vitest';
import { applyOptimisticSwap, cartTotal } from './cartSwap';

describe('optimistic cart swaps', () => {
  const items = [{
    id: 7,
    _id: 7,
    product_id: 11,
    productId: 11,
    quantity: 2,
    source: 'ai_recipe',
    price: 20,
    product: { id: 11, name: 'Old', price: 20 },
  }];

  it('replaces product fields while preserving item identity, quantity, and source', () => {
    const result = applyOptimisticSwap(items, 7, {
      id: 22,
      name: 'New',
      price: 15,
      mrp: 18,
      unit: '500 g',
      imageUrl: '/new.png',
      brand: 'Fresh',
    });

    expect(result[0]).toMatchObject({
      id: 7,
      productId: 22,
      quantity: 2,
      source: 'ai_recipe',
      price: 15,
      name: 'New',
    });
    expect(items[0].productId).toBe(11);
    expect(cartTotal(result)).toBe(30);
  });

  it('leaves unrelated items unchanged', () => {
    expect(applyOptimisticSwap(items, 999, { id: 22 })).toEqual(items);
  });
});
