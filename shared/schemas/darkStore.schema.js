import Joi from 'joi';

export const darkStoreCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  service_radius_km: Joi.number().positive().max(50).required(),
  is_active: Joi.boolean().default(true),
});

export const darkStoreUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  service_radius_km: Joi.number().positive().max(50).optional(),
  is_active: Joi.boolean().optional(),
}).min(1);
