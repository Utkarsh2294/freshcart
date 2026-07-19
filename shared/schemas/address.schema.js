import Joi from 'joi';

export const addressCreateSchema = Joi.object({
  label: Joi.string().max(50).required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  full_address: Joi.string().max(500).required(),
  is_default: Joi.boolean().default(false),
});

export const addressUpdateSchema = Joi.object({
  label: Joi.string().max(50).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  full_address: Joi.string().max(500).optional(),
  is_default: Joi.boolean().optional(),
}).min(1);
