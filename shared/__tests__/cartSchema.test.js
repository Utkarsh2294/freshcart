import { describe, expect, it } from 'vitest';
import { cartItemAddSchema } from '../schemas/cart.schema.js';

describe('cart source contract', () => {
  it.each(['manual', 'ai_recipe', 'buy_again', 'suggestion', 'voice_quick_add', 'predictive_reorder'])(
    'accepts %s',
    source => expect(cartItemAddSchema.validate({ product_id: 1, quantity: 1, source }).error).toBeUndefined(),
  );
});
