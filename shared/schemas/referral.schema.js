import Joi from 'joi';

export const referralRedeemSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(4).max(20).required(),
});
