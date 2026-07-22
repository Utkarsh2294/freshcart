const NUMBER_WORDS = new Map([
  ['a', 1],
  ['an', 1],
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10],
  ['half', 0.5],
]);

const UNIT_ALIASES = new Map([
  ['litre', 'l'],
  ['litres', 'l'],
  ['liter', 'l'],
  ['liters', 'l'],
  ['l', 'l'],
  ['ml', 'ml'],
  ['millilitre', 'ml'],
  ['millilitres', 'ml'],
  ['kg', 'kg'],
  ['kilo', 'kg'],
  ['kilos', 'kg'],
  ['kilogram', 'kg'],
  ['kilograms', 'kg'],
  ['g', 'g'],
  ['gram', 'g'],
  ['grams', 'g'],
  ['pack', 'pack'],
  ['packs', 'pack'],
  ['packet', 'pack'],
  ['packets', 'pack'],
  ['loaf', 'loaf'],
  ['loaves', 'loaf'],
  ['dozen', 'dozen'],
  ['piece', 'pcs'],
  ['pieces', 'pcs'],
  ['pc', 'pcs'],
  ['pcs', 'pcs'],
  ['bottle', 'bottle'],
  ['bottles', 'bottle'],
]);

const FILLER = new Set(['add', 'buy', 'please', 'get', 'me', 'freshcart', 'cart', 'to', 'the', 'of']);

function normalizeTranscript(transcript) {
  return String(transcript || '')
    .toLowerCase()
    .replace(/[,.]/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseQuantity(token) {
  if (!token) return null;
  if (NUMBER_WORDS.has(token)) return NUMBER_WORDS.get(token);
  const numeric = Number(token);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function singularizeName(name) {
  return name
    .replace(/\b(breads)\b/g, 'bread')
    .replace(/\b(eggs)\b/g, 'egg')
    .replace(/\b(tomatoes)\b/g, 'tomato')
    .replace(/\b(onions)\b/g, 'onion')
    .replace(/\b(potatoes)\b/g, 'potato');
}

export function parseQuickAddTranscript(transcript) {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return [];

  return normalized
    .split(/\s+(?:and|plus|with|also)\s+/)
    .map(part => part.split(' ').filter(token => !FILLER.has(token)))
    .map((tokens) => {
      let quantity = 1;
      let unit = null;
      let cursor = 0;

      const firstQty = parseQuantity(tokens[cursor]);
      if (firstQty !== null) {
        quantity = firstQty;
        cursor += 1;
      }

      if (UNIT_ALIASES.has(tokens[cursor])) {
        unit = UNIT_ALIASES.get(tokens[cursor]);
        cursor += 1;
      }

      const name = singularizeName(tokens.slice(cursor).join(' ').trim());
      if (!name) return null;

      return {
        raw: tokens.join(' '),
        quantity,
        unit,
        product_name: name,
      };
    })
    .filter(Boolean);
}
