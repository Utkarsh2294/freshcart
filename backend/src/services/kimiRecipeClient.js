import { structuredRecipeSchema, recipeStepActions } from 'freshcart-shared/schemas/recipe.schema';

const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://openrouter.ai/api/v1';
const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshotai/kimi-k3';
const KIMI_API_KEY = process.env.OPENROUTER_API_KEY || process.env.KIMI_API_KEY;
const KIMI_TIMEOUT_MS = Number(process.env.KIMI_TIMEOUT_MS || 30000);

export class RecipeGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RecipeGenerationError';
    this.cause = cause;
  }
}

function buildPrompt(dishName, servings, dietaryTags = []) {
  const dietaryInstruction = dietaryTags.length
    ? ` The recipe must satisfy all dietary requirements: ${dietaryTags.join(', ')}.`
    : '';
  return `Generate one practical recipe for "${dishName}" for ${servings} servings.
${dietaryInstruction}
Return only valid JSON, no markdown or commentary. Use English and grocery-search-friendly ingredient names.
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
}`;
}

async function callKimi(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), KIMI_TIMEOUT_MS);
  try {
    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KIMI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new RecipeGenerationError(`Kimi returned ${response.status}`, await response.text());
    }
    const body = await response.json();
    return body.choices?.[0]?.message?.content;
  } finally {
    clearTimeout(timeout);
  }
}

function parseAndValidate(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new RecipeGenerationError('Kimi returned malformed JSON', error);
  }

  const { error, value } = structuredRecipeSchema.validate(parsed, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw new RecipeGenerationError('Kimi recipe failed validation', error);
  return value;
}

export async function generateRecipe(dishName, servings, dietaryTags = []) {
  if (!KIMI_API_KEY) {
    throw new RecipeGenerationError('Kimi API key is not configured');
  }

  const prompt = buildPrompt(dishName, servings, dietaryTags);
  try {
    return parseAndValidate(await callKimi(prompt));
  } catch (firstError) {
    try {
      return parseAndValidate(await callKimi(`${prompt}\nThe previous response was invalid. Return strict JSON only.`));
    } catch (secondError) {
      throw new RecipeGenerationError('Unable to generate a valid recipe', secondError || firstError);
    }
  }
}
