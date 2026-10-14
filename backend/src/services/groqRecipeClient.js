import {
  structuredRecipeSchema,
  recipeStepActions,
} from "freshcart-shared/schemas/recipe.schema";

const GROQ_BASE_URL =
  process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS || 12000);
const BREAKER_FAILURE_THRESHOLD = Number(
  process.env.GROQ_BREAKER_FAILURE_THRESHOLD || 3,
);
const BREAKER_RESET_MS = Number(process.env.GROQ_BREAKER_RESET_MS || 30000);

const metrics = {
  calls: 0,
  successes: 0,
  failures: 0,
  latency_ms_total: 0,
  prompt_tokens: 0,
  completion_tokens: 0,
  reported_cost: 0,
};
let consecutiveFailures = 0;
let breakerState = "closed";
let breakerOpenedAt = 0;

export class RecipeGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "RecipeGenerationError";
    this.cause = cause;
  }
}

function buildPrompt(dishName, servings, dietaryTags = []) {
  const dietaryInstruction = dietaryTags.length
    ? ` The recipe must satisfy all dietary requirements: ${dietaryTags.join(", ")}.`
    : "";
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
  "steps": [{"id": integer, "action": one of ${recipeStepActions.join(", ")}, "target": string, "detail": string, "duration_seconds": integer|null, "temperature": string|null}]
}`;
}

async function callGroq(prompt) {
  if (breakerState === "open") {
    if (Date.now() - breakerOpenedAt < BREAKER_RESET_MS) {
      throw new RecipeGenerationError("Groq circuit breaker is open");
    }
    breakerState = "half_open";
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);
  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new RecipeGenerationError(
        `Groq returned ${response.status}`,
        await response.text(),
      );
    }
    const body = await response.json();
    const latencyMs = Date.now() - startedAt;
    metrics.calls += 1;
    metrics.successes += 1;
    metrics.latency_ms_total += latencyMs;
    metrics.prompt_tokens += Number(body.usage?.prompt_tokens || 0);
    metrics.completion_tokens += Number(body.usage?.completion_tokens || 0);
    metrics.reported_cost += Number(body.usage?.cost || 0);
    consecutiveFailures = 0;
    breakerState = "closed";
    console.info(
      JSON.stringify({
        event: "groq_call",
        status: "success",
        latency_ms: latencyMs,
        prompt_tokens: Number(body.usage?.prompt_tokens || 0),
        completion_tokens: Number(body.usage?.completion_tokens || 0),
        reported_cost: Number(body.usage?.cost || 0),
      }),
    );
    return body.choices?.[0]?.message?.content;
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    metrics.calls += 1;
    metrics.failures += 1;
    metrics.latency_ms_total += latencyMs;
    consecutiveFailures += 1;
    if (consecutiveFailures >= BREAKER_FAILURE_THRESHOLD) {
      breakerState = "open";
      breakerOpenedAt = Date.now();
    }
    console.warn(
      JSON.stringify({
        event: "groq_call",
        status: "failure",
        latency_ms: latencyMs,
        breaker_state: breakerState,
        error: error instanceof Error ? error.message : "unknown_error",
      }),
    );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseAndValidate(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new RecipeGenerationError("Groq returned malformed JSON", error);
  }

  const { error, value } = structuredRecipeSchema.validate(parsed, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error)
    throw new RecipeGenerationError("Groq recipe failed validation", error);
  return value;
}

export async function generateRecipe(dishName, servings, dietaryTags = []) {
  if (!GROQ_API_KEY) {
    throw new RecipeGenerationError("Groq API key is not configured");
  }

  const prompt = buildPrompt(dishName, servings, dietaryTags);
  try {
    return parseAndValidate(await callGroq(prompt));
  } catch (firstError) {
    try {
      return parseAndValidate(
        await callGroq(
          `${prompt}\nThe previous response was invalid. Return strict JSON only.`,
        ),
      );
    } catch (secondError) {
      throw new RecipeGenerationError(
        "Unable to generate a valid recipe",
        secondError || firstError,
      );
    }
  }
}

export function getGroqMetrics() {
  return {
    ...metrics,
    average_latency_ms: metrics.calls
      ? Number((metrics.latency_ms_total / metrics.calls).toFixed(2))
      : 0,
    breaker_state: breakerState,
    consecutive_failures: consecutiveFailures,
  };
}
