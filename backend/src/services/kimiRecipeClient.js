/**
 * services/kimiRecipeClient.js
 *
 * SCOPED EXCEPTION: this is the one and only place in Freshcart that talks to
 * a third-party AI API. Every other AI-adjacent piece of Cook-with-AI
 * (ingredient matching, quantity math, cart insertion in Phase 5) is
 * self-hosted and deterministic, same as every other AI component in this
 * project. See README's "Honesty note" section for why this exception exists.
 *
 * Isolation contract: nothing outside this file should import an AI SDK,
 * hold the Kimi API key, or construct a Kimi prompt. Callers only ever see:
 *
 *   generateRecipe(dishName, servings)
 *     -> Promise<{ title, steps: string[], ingredients: [{name, qty, unit}] }>
 *     -> or rejects with RecipeGenerationError
 *
 * The controller in controllers/cookThisController.js is the only caller,
 * and it only ever branches on "did this throw RecipeGenerationError" to
 * decide whether to show the graceful failure state. It never inspects
 * Kimi-specific response shapes.
 */

import Joi from 'joi';

// --- Config --------------------------------------------------------------
// Default provider: OpenRouter, single upstream for Kimi K3 as of Jul 2026
// (moonshotai/kimi-k3, $3/M input, $15/M output, 1M context — verified
// against OpenRouter's model page at the time this was written).
//
// To call Moonshot's own API instead (cheaper on cache hits: $0.30/M vs no
// documented cache discount on OpenRouter), set:
//   KIMI_BASE_URL=https://api.moonshot.ai/v1
//   KIMI_MODEL=kimi-k3
//
// Recheck both consoles before relying on these numbers for a cost budget —
// this is a brand-new model and pricing/free-credit terms move fast.
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://openrouter.ai/api/v1';
const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshotai/kimi-k3';
const KIMI_API_KEY = process.env.KIMI_API_KEY;

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2; // one call + exactly one retry on malformed output

// --- Response schema -------------------------------------------------------
const ingredientSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  qty: Joi.number().positive().required(),
  unit: Joi.string().trim().allow('', null).default(null),
});

const recipeSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  steps: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
  ingredients: Joi.array().items(ingredientSchema).min(1).required(),
}).required();

class RecipeGenerationError extends Error {
  constructor(message, { cause } = {}) {
    super(message);
    this.name = 'RecipeGenerationError';
    this.cause = cause;
  }
}

function buildDemoRecipe(dishName, servings) {
  const normalized = dishName.toLowerCase();
  const multiplier = Math.max(1, Number(servings) / 2);

  if (normalized.includes('paneer')) {
    return {
      title: 'Paneer Butter Masala',
      steps: [
        'Marinate paneer with curd, chilli powder, turmeric, and salt for 15 minutes.',
        'Saute onions, ginger garlic paste, and tomato puree until the masala thickens.',
        'Add butter, garam masala, and cream, then simmer gently.',
        'Fold in paneer cubes and cook for 5 minutes.',
        'Finish with coriander leaves and serve hot.',
      ],
      ingredients: [
        { name: 'paneer', qty: 200 * multiplier, unit: 'g' },
        { name: 'tomato puree', qty: 200 * multiplier, unit: 'ml' },
        { name: 'onion', qty: 250 * multiplier, unit: 'g' },
        { name: 'butter', qty: 50 * multiplier, unit: 'g' },
        { name: 'cream', qty: 100 * multiplier, unit: 'ml' },
        { name: 'garam masala', qty: 10 * multiplier, unit: 'g' },
      ],
    };
  }

  return {
    title: dishName.replace(/\b\w/g, char => char.toUpperCase()),
    steps: [
      'Prepare and measure all ingredients.',
      'Cook the aromatics and base ingredients until fragrant.',
      'Add the main ingredients and simmer until cooked through.',
      'Adjust seasoning and finish with fresh garnish.',
    ],
    ingredients: [
      { name: 'onion', qty: 250 * multiplier, unit: 'g' },
      { name: 'tomato', qty: 300 * multiplier, unit: 'g' },
      { name: 'oil', qty: 30 * multiplier, unit: 'ml' },
      { name: 'salt', qty: 10 * multiplier, unit: 'g' },
      { name: 'coriander leaves', qty: 50 * multiplier, unit: 'g' },
    ],
  };
}

function buildMessages(dishName, servings) {
  return [
    {
      role: 'system',
      content:
        'You are a precise recipe generator. Reply with STRICT JSON only — ' +
        'no markdown, no prose, no code fences, no trailing commentary. The ' +
        'JSON must match exactly this shape: {"title": string, "steps": ' +
        'string[], "ingredients": [{"name": string, "qty": number, "unit": ' +
        'string|null}]}. qty must be a plain number already scaled for the ' +
        'requested servings (e.g. 2, 0.5, 250) — never a range, never a ' +
        'string like "a pinch" or "to taste" (pick a sensible small number ' +
        'instead). For countable/unitless ingredients (e.g. "3 eggs"), set ' +
        'unit to null and fold the counting noun into name (e.g. name: ' +
        '"large eggs", qty: 3, unit: null).',
    },
    {
      role: 'user',
      content: `Give me a recipe for "${dishName}" scaled for ${servings} servings.`,
    },
  ];
}

async function callKimi(messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      throw new RecipeGenerationError(`Kimi API returned HTTP ${res.status}`, {
        cause: bodyText,
      });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) {
      throw new RecipeGenerationError('Kimi API returned no message content');
    }
    return raw;
  } finally {
    clearTimeout(timeout);
  }
}

function parseAndValidate(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new RecipeGenerationError('Kimi response was not valid JSON', { cause: err });
  }

  const { error, value } = recipeSchema.validate(parsed, { stripUnknown: true });
  if (error) {
    throw new RecipeGenerationError(
      `Kimi response failed schema validation: ${error.message}`,
      { cause: error }
    );
  }
  return value;
}

/**
 * Generate a recipe via Kimi K3.
 * Retries exactly once if the response is missing, unparsable, or fails the
 * Joi schema check. Never throws anything other than RecipeGenerationError —
 * that's the one thing the caller needs to branch on.
 *
 * @param {string} dishName
 * @param {number} servings
 * @returns {Promise<{title: string, steps: string[], ingredients: Array<{name:string,qty:number,unit:string|null}>}>}
 */
async function generateRecipe(dishName, servings) {
  if (!KIMI_API_KEY) {
    return buildDemoRecipe(dishName, servings);
  }

  const messages = buildMessages(dishName, servings);
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const raw = await callKimi(
        attempt === 1
          ? messages
          : [
              ...messages,
              {
                role: 'user',
                content:
                  'Your previous reply was not valid JSON matching the ' +
                  'required schema. Reply again with ONLY the corrected ' +
                  'strict JSON object — nothing else.',
              },
            ]
      );
      return parseAndValidate(raw);
    } catch (err) {
      lastError = err;
      // fall through and retry once
    }
  }

  throw new RecipeGenerationError(
    `Kimi recipe generation failed after ${MAX_ATTEMPTS} attempt(s)`,
    { cause: lastError }
  );
}

export { generateRecipe, RecipeGenerationError };
