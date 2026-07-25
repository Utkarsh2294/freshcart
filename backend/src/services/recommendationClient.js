/**
 * services/recommendationClient.js
 *
 * Phase 2: client for the self-hosted recommendation-service (FastAPI, port 8001).
 * Computes per-user product affinity scores and writes them to product_scores.
 * Falls back gracefully if the service is unreachable — homeController uses the
 * local temporal fallback in that case (same pattern as Pramarsha).
 */

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8001';
const TIMEOUT_MS = 500;

/**
 * Trigger the recommendation service to compute and persist affinity scores
 * for a specific user. Called on home page load for patterned users.
 *
 * @param {number} userId
 * @returns {Promise<{scored: number}|null>} null on any failure (graceful)
 */
export async function scoreUserAffinity(userId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${RECOMMENDATION_SERVICE_URL}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch top N product IDs by affinity score for a user from the service.
 *
 * @param {number} userId
 * @param {number} limit
 * @returns {Promise<number[]>} sorted product IDs, empty on failure
 */
export async function getTopProductIds(userId, limit = 10) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = new URL('/top', RECOMMENDATION_SERVICE_URL);
    url.searchParams.set('user_id', userId);
    url.searchParams.set('limit', limit);
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const data = await res.json();
    return data.product_ids || [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
