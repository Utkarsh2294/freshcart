import Joi from 'joi';

export const referralRedeemSchema = Joi.object({
  code: Joi.string().alphanum().length(8).required(),
});

export const pushSubscribeSchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required(),
  }).required(),
});
