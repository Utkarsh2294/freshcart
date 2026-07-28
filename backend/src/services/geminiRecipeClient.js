import { structuredRecipeSchema, recipeStepActions } from 'freshcart-shared/schemas/recipe.schema';

const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class RecipeGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RecipeGenerationError';
    this.cause = cause;
  }
}

function buildDemoRecipe(dishName, servings) {
  return {
    title: `${dishName.replace(/\b\w/g, letter => letter.toUpperCase())}`,
    description: `A practical Freshcart-ready recipe for ${servings} servings.`,
    prep_time_minutes: 15,
    cook_time_minutes: 25,
    difficulty: 'medium',
    cuisine_tags: ['indian', 'home-style'],
    ingredients: [
      { name: 'paneer', qty: 400, unit: 'g', notes: 'cubed' },
      { name: 'onion', qty: 2, unit: 'pcs', notes: 'finely chopped' },
      { name: 'tomato', qty: 3, unit: 'pcs', notes: 'pureed' },
      { name: 'butter', qty: 2, unit: 'tbsp', notes: null },
      { name: 'cream', qty: 100, unit: 'ml', notes: null },
      { name: 'masala', qty: 2, unit: 'tsp', notes: 'adjust to taste' },
    ],
    steps: [
      { id: 1, action: 'prep', target: 'paneer and vegetables', detail: 'Cut paneer, chop onion, and puree tomato.', duration_seconds: 600, temperature: null },
      { id: 2, action: 'heat', target: 'butter in a pan', detail: 'Warm butter until it melts and smells nutty.', duration_seconds: 120, temperature: 'medium heat' },
      { id: 3, action: 'saute', target: 'onion', detail: 'Cook onion until lightly golden.', duration_seconds: 420, temperature: 'medium heat' },
      { id: 4, action: 'simmer', target: 'tomato masala', detail: 'Add tomato puree and masala, then cook until glossy.', duration_seconds: 600, temperature: 'low heat' },
      { id: 5, action: 'mix', target: 'paneer and cream', detail: 'Fold paneer and cream into the sauce.', duration_seconds: 240, temperature: 'low heat' },
      { id: 6, action: 'serve', target: 'finished dish', detail: 'Serve hot with rice, roti, or naan.', duration_seconds: 60, temperature: null },
    ],
  };
}

function buildPrompt(dishName, servings) {
  return `Generate one practical recipe for "${dishName}" for ${servings} servings.
Return only valid JSON, no markdown.
Use English only.
Schema:
{
  "title": string,
  "description": string,
  "prep_time_minutes": integer,
  "cook_time_minutes": integer,
  "difficulty": "easy" | "medium" | "hard",
  "cuisine_tags": string[],
  "ingredients": [{"name": string, "qty": number, "unit": string|null, "notes": string|null}],
  "steps": [{"id": integer, "action": one of ${recipeStepActions.join(', ')}, "target": string, "detail": string, "duration_seconds": integer|null, "temperature": string|null}]
}
Use grocery-search-friendly ingredient names and detailed, safe cooking steps.`;
}

async function callGemini(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new RecipeGenerationError(`Gemini returned ${response.status}`, await response.text());
  }

  const body = await response.json();
  return body.candidates?.[0]?.content?.parts?.[0]?.text;
}

function parseAndValidate(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new RecipeGenerationError('Gemini returned malformed JSON', error);
  }

  const { error, value } = structuredRecipeSchema.validate(parsed, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw new RecipeGenerationError('Gemini recipe failed validation', error);
  return value;
}

export async function generateRecipe(dishName, servings) {
  if (!GEMINI_API_KEY) {
    return buildDemoRecipe(dishName, servings);
  }

  const prompt = buildPrompt(dishName, servings);
  try {
    return parseAndValidate(await callGemini(prompt));
  } catch (firstError) {
    try {
      return parseAndValidate(await callGemini(`${prompt}\nFix the previous output: strict JSON only, no extra keys.`));
    } catch (secondError) {
      throw new RecipeGenerationError('Unable to generate a valid recipe', secondError || firstError);
    }
  }
}
