import { afterEach, describe, expect, it, vi } from 'vitest';

const validRecipe = {
  title: 'Paneer Butter Masala',
  description: 'A rich paneer curry.',
  prep_time_minutes: 15,
  cook_time_minutes: 25,
  difficulty: 'medium',
  cuisine_tags: ['indian'],
  ingredients: [{ name: 'paneer', qty: 400, unit: 'g', notes: null }],
  steps: [{
    id: 1,
    action: 'prep',
    target: 'paneer',
    detail: 'Cube the paneer.',
    duration_seconds: 60,
    temperature: null,
  }],
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.KIMI_API_KEY;
  vi.resetModules();
});

describe('Kimi recipe client', () => {
  it('fails clearly without an API key instead of returning a fake recipe', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const { generateRecipe, RecipeGenerationError } = await import('../../src/services/kimiRecipeClient.js');
    await expect(generateRecipe('paneer butter masala', 4)).rejects.toBeInstanceOf(RecipeGenerationError);
  });

  it('retries one malformed response and returns validated JSON', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: 'not json' } }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(validRecipe) } }] }) });
    vi.stubGlobal('fetch', fetchMock);

    const { generateRecipe } = await import('../../src/services/kimiRecipeClient.js');
    const result = await generateRecipe('paneer butter masala', 4);

    expect(result.title).toBe(validRecipe.title);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.model).toBe('moonshotai/kimi-k3');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key');
  });
});
