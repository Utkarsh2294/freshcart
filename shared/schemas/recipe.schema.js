import Joi from 'joi';

export const recipeStepActions = [
  'prep',
  'wash',
  'chop',
  'mix',
  'heat',
  'saute',
  'boil',
  'simmer',
  'fry',
  'bake',
  'roast',
  'blend',
  'season',
  'rest',
  'serve',
];

export const structuredIngredientSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  qty: Joi.number().positive().required(),
  unit: Joi.string().allow('', null).default(null),
  notes: Joi.string().allow('', null).default(null),
}).required();

export const structuredRecipeStepSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  action: Joi.string().valid(...recipeStepActions).required(),
  target: Joi.string().trim().min(1).required(),
  detail: Joi.string().trim().min(1).required(),
  duration_seconds: Joi.number().integer().min(0).allow(null).default(null),
  temperature: Joi.string().allow('', null).default(null),
}).required();

export const structuredRecipeSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow('', null).default(null),
  prep_time_minutes: Joi.number().integer().min(0).required(),
  cook_time_minutes: Joi.number().integer().min(0).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  cuisine_tags: Joi.array().items(Joi.string().trim().min(1)).default([]),
  ingredients: Joi.array().items(structuredIngredientSchema).min(1).required(),
  steps: Joi.array().items(structuredRecipeStepSchema).min(1).required(),
}).required();
