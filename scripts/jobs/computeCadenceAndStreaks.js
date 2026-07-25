/**
 * scripts/jobs/computeCadenceAndStreaks.js
 *
 * Pramarsha 2.0 — Nightly job that computes per-user, per-category reorder cadence.
 * Populates user_category_cadence with median days between orders per category.
 *
 * Phase B: cadence computation only.
 * Phase C: streak computation will be added here.
 *
 * Run: node scripts/jobs/computeCadenceAndStreaks.js
 * Schedule: nightly via cron or task runner.
 *
 * Uses the same pg.Pool / DATABASE_URL pattern as scripts/migrate.js.
 * No ML libraries — pure SQL aggregation + JS median calculation (§7.2).
 */

import pg from 'pg';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://freshcart:freshcart_pass@localhost:5433/freshcart';

/**
 * Compute the median of a sorted numeric array.
 * @param {number[]} sorted - ascending-sorted array of numbers
 * @returns {number|null}
 */
function median(sorted) {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function computeCadence() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('▶  Computing per-user per-category reorder cadence...');

    // Fetch all users with ≥ 3 orders (need at least 3 to compute meaningful cadence)
    const usersResult = await client.query(`
      SELECT DISTINCT o.user_id
      FROM orders o
      GROUP BY o.user_id
      HAVING COUNT(*) >= 3
    `);

    const userIds = usersResult.rows.map(r => r.user_id);
    console.log(`   Found ${userIds.length} users with ≥ 3 orders.`);

    let upserted = 0;

    for (const userId of userIds) {
      // Get all (category_id, order_date) pairs for this user, ordered chronologically
      const ordersResult = await client.query(`
        SELECT
          p.category_id,
          o.created_at::date AS order_date
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE o.user_id = $1
        ORDER BY p.category_id, o.created_at
      `, [userId]);

      // Group by category_id and compute gaps
      const categoryOrders = new Map();
      for (const row of ordersResult.rows) {
        if (!categoryOrders.has(row.category_id)) {
          categoryOrders.set(row.category_id, []);
        }
        categoryOrders.get(row.category_id).push(new Date(row.order_date));
      }

      for (const [categoryId, dates] of categoryOrders) {
        // Dedupe dates (same category may appear in multiple items per order)
        const uniqueDates = [...new Set(dates.map(d => d.toISOString().slice(0, 10)))]
          .map(s => new Date(s))
          .sort((a, b) => a - b);

        if (uniqueDates.length < 2) continue; // Need ≥ 2 distinct order dates for a gap

        // Compute gaps in days between consecutive orders
        const gaps = [];
        for (let i = 1; i < uniqueDates.length; i++) {
          const diffMs = uniqueDates[i] - uniqueDates[i - 1];
          gaps.push(diffMs / (1000 * 60 * 60 * 24)); // days
        }

        gaps.sort((a, b) => a - b);
        const medianDays = median(gaps);
        const lastOrdered = uniqueDates[uniqueDates.length - 1];

        await client.query(`
          INSERT INTO user_category_cadence (user_id, category_id, median_reorder_days, last_ordered_at, order_count)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, category_id)
          DO UPDATE SET
            median_reorder_days = EXCLUDED.median_reorder_days,
            last_ordered_at = EXCLUDED.last_ordered_at,
            order_count = EXCLUDED.order_count
        `, [userId, categoryId, medianDays, lastOrdered, uniqueDates.length]);

        upserted++;
      }
    }

    console.log(`✅ Cadence computation complete. ${upserted} rows upserted.`);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Recurrence type per reason_tag — determines what "consecutive" means for streaks.
 * daily: 3+ of last N matching calendar days
 * weekly: 3+ consecutive matching weeks (e.g. sunday_staples)
 * monthly: 3+ consecutive months (e.g. monthly_staples)
 */
const TAG_RECURRENCE = {
  early_morning_essentials: 'daily',
  weekday_breakfast: 'daily',
  weekend_brunch: 'weekly',
  midday_topup: 'daily',
  evening_snacks: 'daily',
  dinner_prep: 'daily',
  late_night_munchies: 'daily',
  sunday_staples: 'weekly',
  monthly_staples: 'monthly',
};

/**
 * Given a timestamp, return the temporal reason_tag that would have applied.
 * Mirrors getTemporalReasonTag() in homeController.js.
 */
function getTagForTimestamp(ts) {
  const hour = ts.getHours();
  const minutes = ts.getMinutes();
  const dayOfWeek = ts.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const timeInMinutes = hour * 60 + minutes;

  if (timeInMinutes >= 1350 || timeInMinutes < 120) return 'late_night_munchies';
  if (timeInMinutes < 540) return 'early_morning_essentials';
  if (timeInMinutes < 720) return isWeekend ? 'weekend_brunch' : 'weekday_breakfast';
  if (timeInMinutes < 960) return 'midday_topup';
  if (timeInMinutes < 1200) return 'evening_snacks';
  return 'dinner_prep';
}

/**
 * Return a recurrence period key for grouping consecutive occurrences.
 * daily: "YYYY-MM-DD", weekly: "YYYY-WW", monthly: "YYYY-MM"
 */
function periodKey(date, recurrenceType) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  if (recurrenceType === 'monthly') return `${year}-${month}`;
  if (recurrenceType === 'weekly') {
    // ISO week number
    const d = new Date(Date.UTC(year, date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
  // daily
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Count the length of the most recent consecutive run of periods.
 * @param {string[]} sortedPeriods - ascending-sorted unique period keys
 * @returns {number}
 */
function countConsecutiveFromEnd(sortedPeriods) {
  if (sortedPeriods.length < 2) return sortedPeriods.length;

  let streak = 1;
  for (let i = sortedPeriods.length - 1; i > 0; i--) {
    // For simplicity, check adjacency by index gap = 1 in the sorted list.
    // This works because we're using unique, sorted period keys that naturally
    // increment by one unit (day/week/month). Non-consecutive gaps break the streak.
    const curr = sortedPeriods[i];
    const prev = sortedPeriods[i - 1];

    if (areAdjacentPeriods(prev, curr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Check if two period keys are adjacent (consecutive day/week/month).
 */
function areAdjacentPeriods(a, b) {
  // Parse dates from period keys and check if b is exactly 1 period after a
  // Daily: YYYY-MM-DD
  if (a.length === 10 && b.length === 10) {
    const da = new Date(a);
    const db = new Date(b);
    const diffDays = (db - da) / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  }
  // Weekly: YYYY-WNN
  if (a.includes('-W') && b.includes('-W')) {
    const [ya, wa] = a.split('-W').map(Number);
    const [yb, wb] = b.split('-W').map(Number);
    if (ya === yb) return wb - wa === 1;
    if (yb === ya + 1 && wb === 1) return wa >= 52; // year boundary
    return false;
  }
  // Monthly: YYYY-MM
  if (a.length === 7 && b.length === 7) {
    const [ya, ma] = a.split('-').map(Number);
    const [yb, mb] = b.split('-').map(Number);
    if (ya === yb) return mb - ma === 1;
    if (yb === ya + 1 && mb === 1 && ma === 12) return true;
    return false;
  }
  return false;
}

async function computeStreaks() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('▶  Computing per-user per-tag streaks...');

    // Check if the streak table exists yet (Phase C migration may not have run)
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_reason_tag_streaks'
      ) AS exists
    `);
    if (!tableCheck.rows[0].exists) {
      console.log('⏭  user_reason_tag_streaks table does not exist yet — skipping streak computation.');
      return;
    }

    // Get all users with orders
    const usersResult = await client.query(`
      SELECT DISTINCT user_id FROM orders
    `);

    let upserted = 0;

    for (const { user_id: userId } of usersResult.rows) {
      // Get all order timestamps for this user
      const ordersResult = await client.query(`
        SELECT DISTINCT o.created_at
        FROM orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at
      `, [userId]);

      // For each order, determine the temporal tag and group by tag + period
      const tagPeriods = new Map(); // tag -> Set of period keys

      for (const { created_at } of ordersResult.rows) {
        const ts = new Date(created_at);
        const tag = getTagForTimestamp(ts);
        const recurrence = TAG_RECURRENCE[tag] || 'daily';
        const pk = periodKey(ts, recurrence);

        if (!tagPeriods.has(tag)) tagPeriods.set(tag, new Set());
        tagPeriods.get(tag).add(pk);
      }

      // Compute streak for each tag
      for (const [tag, periods] of tagPeriods) {
        const sortedPeriods = [...periods].sort();
        const streak = countConsecutiveFromEnd(sortedPeriods);
        const recurrence = TAG_RECURRENCE[tag] || 'daily';

        await client.query(`
          INSERT INTO user_reason_tag_streaks (user_id, reason_tag, recurrence_type, current_streak, last_matched_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (user_id, reason_tag)
          DO UPDATE SET
            recurrence_type = EXCLUDED.recurrence_type,
            current_streak = EXCLUDED.current_streak,
            last_matched_at = NOW()
        `, [userId, tag, recurrence, streak]);

        upserted++;
      }
    }

    console.log(`✅ Streak computation complete. ${upserted} rows upserted.`);
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  await computeCadence();
  await computeStreaks();
}

main().catch(err => {
  console.error('❌ Cadence/streak computation failed:', err);
  process.exit(1);
});
