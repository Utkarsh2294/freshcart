import Joi from 'joi';

export const productQuerySchema = Joi.object({
  category: Joi.number().integer().positive().optional(),
  brand: Joi.number().integer().positive().optional(),
  search: Joi.string().max(200).optional(),
  sort: Joi.string().valid('price_asc', 'price_desc', 'newest', 'popular', 'relevance', 'deals').default('popular'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
});

export const productCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  category_id: Joi.number().integer().positive().required(),
  brand_id: Joi.number().integer().positive().required(),
  price: Joi.number().precision(2).positive().required(),
  unit: Joi.string().max(50).required(),
  stock_qty: Joi.number().integer().min(0).default(100),
  image_url: Joi.string().uri().optional().allow(''),
  attributes: Joi.object().optional(),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  category_id: Joi.number().integer().positive().optional(),
  brand_id: Joi.number().integer().positive().optional(),
  price: Joi.number().precision(2).positive().optional(),
  unit: Joi.string().max(50).optional(),
  stock_qty: Joi.number().integer().min(0).optional(),
  image_url: Joi.string().uri().optional().allow(''),
  attributes: Joi.object().optional(),
}).min(1);
