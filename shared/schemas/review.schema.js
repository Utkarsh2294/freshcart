import Joi from 'joi';

export const reviewCreateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  review_text: Joi.string().max(1000).optional().allow(''),
});
