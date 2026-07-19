/**
 * Generate synthetic reviews for seeded products.
 */

const REVIEW_TEXTS = [
  'Great quality, will buy again!',
  'Fresh and good value for money.',
  'Average quality, could be better.',
  'Excellent product, fast delivery!',
  'Not as fresh as expected.',
  'Love this brand, always reliable.',
  'Good packaging, arrived in perfect condition.',
  'Decent product for the price.',
  'Best I have found online.',
  'Regular purchase for our household.',
  'Slightly overpriced but good quality.',
  'Would recommend to friends and family.',
  '',  // Some reviews are rating-only
  '',
];

export async function generateSyntheticReviews(client, userId) {
  const { rows: products } = await client.query(
    'SELECT id FROM products ORDER BY RANDOM() LIMIT 30'
  );

  let count = 0;
  for (const product of products) {
    const numReviews = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numReviews; i++) {
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 star bias
      const text = REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)];
      try {
        await client.query(
          `INSERT INTO reviews (product_id, user_id, rating, review_text)
           VALUES ($1, $2, $3, $4)`,
          [product.id, userId, rating, text || null]
        );
        count++;
      } catch {
        // Skip duplicates
      }
    }
  }
  return count;
}
