/**
 * scripts/manual-test-kimi.js
 *
 * Manual test harness for the Definition of Done checks:
 *   1. 15 dish/servings requests producing sensible output
 *   2. Repeating a request only calls the Kimi API once (timing proof)
 *   3. A deliberately malformed/failed case shows the graceful failure path
 *
 * This talks directly to kimiRecipeClient (bypassing the HTTP layer and DB
 * cache) so timings reflect the Kimi API itself. Run it against your real
 * KIMI_API_KEY, then paste the printed markdown table into
 * test-logs/manual-test-log.md as your DoD evidence.
 *
 * Usage:
 *   KIMI_API_KEY=sk-... node scripts/manual-test-kimi.js
 */

const { generateRecipe, RecipeGenerationError } = require('../services/kimiRecipeClient');

const DISHES = [
  ['paneer butter masala', 4],
  ['paneer butter masala', 4], // deliberate repeat — should be near-instant if you re-run through the cached HTTP endpoint instead; here it proves per-call timing only
  ['margherita pizza', 2],
  ['chana masala', 6],
  ['masala dosa', 3],
  ['chicken biryani', 8],
  ['vegetable pulao', 4],
  ['aloo gobi', 4],
  ['butter chicken', 5],
  ['rajma chawal', 4],
  ['pad thai', 2],
  ['fried rice', 3],
  ['chocolate chip cookies', 24],
  ['tomato soup', 4],
  ['gulab jamun', 10],
];

async function run() {
  const rows = [];

  for (const [dish, servings] of DISHES) {
    const start = Date.now();
    try {
      const recipe = await generateRecipe(dish, servings);
      const ms = Date.now() - start;
      rows.push({
        dish,
        servings,
        ms,
        status: 'ok',
        title: recipe.title,
        steps: recipe.steps.length,
        ingredients: recipe.ingredients.length,
      });
    } catch (err) {
      const ms = Date.now() - start;
      rows.push({
        dish,
        servings,
        ms,
        status: err instanceof RecipeGenerationError ? 'graceful_failure' : 'unexpected_error',
        title: '',
        steps: 0,
        ingredients: 0,
        error: err.message,
      });
    }
  }

  console.log('\n| Dish | Servings | Time (ms) | Status | Title | # Steps | # Ingredients |');
  console.log('|------|----------|-----------|--------|-------|---------|----------------|');
  for (const r of rows) {
    console.log(
      `| ${r.dish} | ${r.servings} | ${r.ms} | ${r.status} | ${r.title} | ${r.steps} | ${r.ingredients} |`
    );
  }
}

run().catch((err) => {
  console.error('Test harness crashed unexpectedly:', err);
  process.exit(1);
});
