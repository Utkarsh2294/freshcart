import Joi from 'joi';

export const cartItemAddSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(50).default(1),
  source: Joi.string().valid('manual', 'ai_recipe', 'buy_again', 'suggestion').default('manual'),
});

export const cartItemUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(50).required(),
});
