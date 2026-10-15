import Joi from "joi";

export const emailLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required(),
  password: Joi.string().min(6).max(128).required(),
});

export const emailSignupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required(),
  password: Joi.string().min(6).max(128).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const guestSessionSchema = Joi.object({
  guest_key: Joi.string().guid({ version: "uuidv4" }).required(),
});
