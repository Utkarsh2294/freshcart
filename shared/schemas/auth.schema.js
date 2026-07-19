import Joi from 'joi';

export const emailLoginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(255).required(),
  password: Joi.string().min(6).max(128).required(),
});

export const emailSignupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email({ tlds: { allow: false } }).max(255).required(),
  password: Joi.string().min(6).max(128).required(),
});

export const otpRequestSchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required()
    .messages({ 'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number' }),
});

export const otpVerifySchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  otp: Joi.string().length(6).required(),
  name: Joi.string().min(2).max(100).optional(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
