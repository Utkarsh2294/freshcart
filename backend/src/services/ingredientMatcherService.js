const STOP_WORDS = new Set([
  'fresh', 'large', 'small', 'medium', 'whole', 'chopped', 'sliced', 'powder',
  'paste', 'heavy', 'full', 'cottage', 'cheese', 'optional',
]);

const UNIT_TO_BASE = {
  g: { unit: 'g', factor: 1 },
  gram: { unit: 'g', factor: 1 },
  grams: { unit: 'g', factor: 1 },
  kg: { unit: 'g', factor: 1000 },
  ml: { unit: 'ml', factor: 1 },
  l: { unit: 'ml', factor: 1000 },
  litre: { unit: 'ml', factor: 1000 },
  liter: { unit: 'ml', factor: 1000 },
  tbsp: { unit: 'ml', factor: 15 },
  tsp: { unit: 'ml', factor: 5 },
  pcs: { unit: 'pcs', factor: 1 },
  pc: { unit: 'pcs', factor: 1 },
  piece: { unit: 'pcs', factor: 1 },
  pieces: { unit: 'pcs', factor: 1 },
};

const SYNONYMS = {
  paneer: ['paneer', 'cottage'],
  tomato: ['tomato', 'puree'],
  onion: ['onion'],
  onions: ['onion'],
  curd: ['curd', 'dahi', 'yogurt'],
  yoghurt: ['curd', 'dahi', 'yogurt'],
  yogurt: ['curd', 'dahi', 'yogurt'],
  butter: ['butter'],
  cream: ['cream'],
  milk: ['milk'],
  salt: ['salt'],
  rice: ['rice'],
  atta: ['atta', 'flour'],
  flour: ['atta', 'flour'],
  oil: ['oil'],
  dal: ['dal'],
  masala: ['masala'],
  chilli: ['chilli', 'mirch'],
  chili: ['chilli', 'mirch'],
  coriander: ['coriander'],
  garlic: ['garlic'],
  ginger: ['ginger'],
  eggs: ['egg', 'eggs'],
  egg: ['egg', 'eggs'],
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokensFor(value) {
  const tokens = normalizeText(value)
    .split(' ')
    .filter(token => token && token.length > 1 && !STOP_WORDS.has(token));

  return [...new Set(tokens.flatMap(token => SYNONYMS[token] || [token]))];
}

function normalizeQuantity(qty, unit) {
  const amount = Number(qty);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const normalizedUnit = normalizeText(unit || '').split(' ')[0];
  const conversion = UNIT_TO_BASE[normalizedUnit];
  if (!conversion) return null;

  return {
    value: amount * conversion.factor,
    unit: conversion.unit,
  };
}

function parsePack(unitText) {
  const match = String(unitText || '').toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g|grams?|l|ml|liters?|litres?|pcs?|pieces?)/);
  if (!match) return null;
  return normalizeQuantity(Number(match[1]), match[2]);
}

function scoreProduct(ingredient, product) {
  const ingredientTokens = tokensFor(ingredient.name);
  const productTokens = tokensFor(`${product.name} ${product.brand || ''} ${product.category || ''}`);
  if (!ingredientTokens.length || !productTokens.length) return 0;

  const productSet = new Set(productTokens);
  const normalizedIngredient = normalizeText(ingredient.name);
  const normalizedProduct = normalizeText(product.name);
  if (normalizedProduct === normalizedIngredient) return 1.5;
  if (normalizedProduct.includes(normalizedIngredient)) {
    return 1.35 + Math.max(0, 0.08 - productTokens.length * 0.01);
  }

  const hits = ingredientTokens.filter(token => productSet.has(token)).length;
  const exactNameBonus = normalizedProduct.includes(normalizedIngredient) ? 0.25 : 0;
  const ingredientBonus = productTokens.some(token => ingredientTokens.includes(token)) ? 0.15 : 0;

  return Math.min(1, hits / ingredientTokens.length + exactNameBonus + ingredientBonus);
}

function selectPack(ingredient, product) {
  const needed = normalizeQuantity(ingredient.qty, ingredient.unit);
  const pack = parsePack(product.unit);

  if (!needed || !pack || needed.unit !== pack.unit) {
    return {
      quantity: 1,
      match_type: 'closest',
      note: `Closest catalog match; recipe needs ${ingredient.qty}${ingredient.unit ? ` ${ingredient.unit}` : ''}.`,
    };
  }

  const ratio = needed.value / pack.value;
  if (Math.abs(ratio - Math.round(ratio)) < 0.001) {
    const quantity = Math.max(1, Math.round(ratio));
    return {
      quantity,
      match_type: quantity === 1 ? 'exact' : 'multi_pack',
      note: quantity === 1 ? 'Exact pack covers the recipe quantity.' : `${quantity} packs cover the recipe quantity exactly.`,
    };
  }

  if (pack.value >= needed.value) {
    return {
      quantity: 1,
      match_type: 'oversized',
      note: `Smallest available pack covers ${Math.ceil((pack.value / needed.value) * 100)}% of the needed quantity.`,
    };
  }

  return {
    quantity: Math.ceil(ratio),
    match_type: 'closest',
    note: 'Multiple packs are needed to cover the recipe quantity.',
  };
}

export function matchIngredientsToProducts(ingredients, products) {
  return ingredients.map((ingredient) => {
    const ranked = products
      .map(product => ({ product, score: scoreProduct(ingredient, product) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || Number(a.product.price) - Number(b.product.price));

    const best = ranked[0];
    if (!best) {
      return {
        ingredient,
        selected: false,
        product: null,
        quantity: 0,
        match_type: 'no_match',
        note: 'No close product match found in this catalog.',
        confidence_score: 0,
      };
    }

    const packSelection = selectPack(ingredient, best.product);

    return {
      ingredient,
      selected: true,
      product: best.product,
      quantity: packSelection.quantity,
      match_type: packSelection.match_type,
      note: packSelection.note,
      confidence_score: Number(best.score.toFixed(2)),
      alternatives: ranked.slice(1, 4).map(item => ({
        product: item.product,
        confidence_score: Number(item.score.toFixed(2)),
      })),
    };
  });
}
