import Joi from 'joi';

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
}).min(1);
