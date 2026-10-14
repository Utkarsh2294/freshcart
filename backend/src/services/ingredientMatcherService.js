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

export function selectPack(ingredient, candidateProducts) {
  const needed = normalizeQuantity(ingredient.qty, ingredient.unit);
  const candidates = candidateProducts
    .map(product => ({ product, pack: parsePack(product.unit) }))
    .filter(candidate => candidate.pack && needed && candidate.pack.unit === needed.unit);

  if (!needed || !candidates.length) {
    return {
      product: candidateProducts[0],
      quantity: 1,
      match_type: 'closest',
      note: `Closest catalog match; recipe needs ${ingredient.qty}${ingredient.unit ? ` ${ingredient.unit}` : ''}.`,
    };
  }

  const singlePacks = candidates
    .filter(candidate => candidate.pack.value >= needed.value)
    .sort((a, b) => a.pack.value - b.pack.value || Number(a.product.price) - Number(b.product.price));

  if (singlePacks.length) {
    const selected = singlePacks[0];
    const ratio = selected.pack.value / needed.value;
    const matchType = ratio <= 1.2 ? 'exact' : ratio > 2 ? 'oversized' : 'closest';
    return {
      product: selected.product,
      quantity: 1,
      match_type: matchType,
      note: matchType === 'exact'
        ? 'Smallest available pack closely matches the recipe quantity.'
        : matchType === 'oversized'
          ? 'Smallest available pack is more than twice the needed quantity.'
          : 'Smallest available pack covers the recipe quantity.',
    };
  }

  const selected = candidates
    .map(candidate => {
      const quantity = Math.ceil(needed.value / candidate.pack.value);
      return { ...candidate, quantity, excess: quantity * candidate.pack.value - needed.value };
    })
    .sort((a, b) => a.excess - b.excess || a.quantity - b.quantity || Number(a.product.price) - Number(b.product.price))[0];

  return {
    product: selected.product,
    quantity: selected.quantity,
    match_type: 'closest',
    note: `${selected.quantity} x ${selected.product.unit} packs are the closest available quantity.`,
  };
}

export function matchIngredientsToProducts(ingredients, products) {
  return ingredients.map((ingredient) => {
    const ranked = products
      .map(product => ({ product, score: scoreProduct(ingredient, product) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || Number(a.product.price) - Number(b.product.price));

    if (!ranked.length) {
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

    const available = ranked.filter(item => Number(item.product.stock_qty) > 0);
    if (!available.length) {
      return {
        ingredient,
        selected: false,
        product: null,
        quantity: 0,
        match_type: 'out_of_stock',
        note: 'Matching products exist but are out of stock nearby.',
        confidence_score: Number(ranked[0].score.toFixed(2)),
      };
    }

    const best = available[0];
    if (best.score < 0.75) {
      return {
        ingredient,
        selected: false,
        product: best.product,
        quantity: 1,
        match_type: 'closest',
        note: 'Not sure about this match - search manually before adding it.',
        confidence_score: Number(best.score.toFixed(2)),
        alternatives: available.slice(1, 4).map(item => ({ product: item.product, confidence_score: Number(item.score.toFixed(2)) })),
      };
    }

    const packCandidates = available
      .filter(item => item.score >= Math.max(0.75, best.score - 0.15))
      .map(item => item.product);
    const packSelection = selectPack(ingredient, packCandidates);

    return {
      ingredient,
      selected: true,
      product: packSelection.product,
      quantity: packSelection.quantity,
      match_type: packSelection.match_type,
      note: packSelection.note,
      confidence_score: Number(best.score.toFixed(2)),
      alternatives: available.filter(item => item.product.id !== packSelection.product.id).slice(0, 3).map(item => ({
        product: item.product,
        confidence_score: Number(item.score.toFixed(2)),
      })),
    };
  });
}
