import Joi from 'joi';
import { PAYMENT_METHOD_VALUES } from '../enums/paymentMethod.js';

export const orderCreateSchema = Joi.object({
  address_id: Joi.number().integer().positive().optional(),
  address: Joi.object({
    street: Joi.string().max(255).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    state: Joi.string().max(100).optional().allow(''),
    zip: Joi.string().max(20).optional().allow(''),
    full_address: Joi.string().max(500).optional().allow(''),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
  }).optional(),
  payment_method: Joi.string().valid(...PAYMENT_METHOD_VALUES).required(),
  apply_wallet: Joi.boolean().default(false),
  razorpay_payment_id: Joi.string().optional().allow(''),
}).or('address_id', 'address');
