import { pool } from '../config/database.js';
import { URL } from 'url';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRAMARSHA_TIMEOUT_MS = Number(process.env.PRAMARSHA_TIMEOUT_MS || 350);
const MIN_RECOMMENDATION_CONFIDENCE = Number(process.env.MIN_RECOMMENDATION_CONFIDENCE || 0.4);

// Signal priority for tie-breaking (lower index = higher priority) — §10
const SIGNAL_PRIORITY = ['replenishment', 'weather', 'event', 'cadence', 'streak', 'temporal'];

// Phase D feature flags (§7.3, §7.4) — default off, require human sign-off (§9 constraint 9)
const WEATHER_SIGNAL_ENABLED = ['true', '1', 'yes', 'on'].includes(
  String(process.env.WEATHER_SIGNAL_ENABLED || 'false').toLowerCase()
);
const EVENT_SIGNAL_ENABLED = ['true', '1', 'yes', 'on'].includes(
  String(process.env.EVENT_SIGNAL_ENABLED || 'false').toLowerCase()
);

// Lazy-load festival calendar (Phase D)
let _festivalCalendar = null;
function getFestivalCalendar() {
  if (_festivalCalendar) return _festivalCalendar;
  try {
    const calendarPath = join(__dirname, '..', 'data', 'festivalCalendar.json');
    _festivalCalendar = JSON.parse(readFileSync(calendarPath, 'utf-8'));
  } catch {
    _festivalCalendar = [];
  }
  return _festivalCalendar;
}

/**
 * Maps every reason_tag in the Pramarsha 2.0 taxonomy (§3) to its display headline.
 * Covers 6 temporal buckets + cadence/replenishment/weather/event/streak signals.
 */
function headlineForReason(reasonTag) {
  const labels = {
    // temporal (6 buckets)
    early_morning_essentials: 'Start your day right',
    weekday_breakfast: 'Breakfast basics for right now',
    weekend_brunch: 'Weekend brunch, sorted',
    midday_topup: 'Missing something for lunch?',
    evening_snacks: 'Evening snack picks are waiting',
    dinner_prep: 'Dinner in a hurry? Sorted',
    late_night_munchies: 'Late-night cravings, handled',
    // cadence
    sunday_staples: 'Your Sunday staples are ready',
    monthly_staples: 'Monthly staples you usually pick now',
    // replenishment
    dairy_restock: 'Time to restock your dairy shelf',
    running_low: "You're probably running low on this",
    // weather
    rainy_day_comfort: 'Rain outside, comfort in your cart',
    heatwave_cooldown: 'Beat the heat',
    // event
    matchday_snacks: 'Game night snacks, sorted',
    festival_essentials: 'Getting ready for the festivities?',
    // streak
    streak_keeper: "You've kept this streak going \u2014 want to continue?",
    // fallback
    usual_picks: 'Your usual picks are ready',
  };
  return labels[reasonTag] || labels.usual_picks;
}

/**
 * Determines the temporal reason_tag for the current time of day and day of week.
 * 6-bucket system (Pramarsha 2.0 §3) with 30-minute precision for the dinner→late-night boundary.
 *
 * Buckets:
 *   22:30–02:00 → late_night_munchies (wraps past midnight)
 *   02:00–09:00 → early_morning_essentials (pre-dawn + morning)
 *   09:00–12:00 → weekday_breakfast (Mon–Fri) / weekend_brunch (Sat–Sun)
 *   12:00–16:00 → midday_topup
 *   16:00–20:00 → evening_snacks
 *   20:00–22:30 → dinner_prep
 *
 * @param {Date} now
 * @returns {string} reason_tag
 */
function getTemporalReasonTag(now) {
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const timeInMinutes = hour * 60 + minutes;

  // 22:30–02:00 → late_night_munchies (wraps past midnight)
  if (timeInMinutes >= 1350 || timeInMinutes < 240) return 'late_night_munchies';
  // 02:00–09:00 → early_morning_essentials (pre-dawn + morning)
  if (timeInMinutes < 540) return 'early_morning_essentials';
  // 09:00–12:00 → weekday_breakfast / weekend_brunch
  if (timeInMinutes < 720) return isWeekend ? 'weekend_brunch' : 'weekday_breakfast';
  // 12:00–16:00 → midday_topup
  if (timeInMinutes < 960) return 'midday_topup';
  // 16:00–20:00 → evening_snacks
  if (timeInMinutes < 1200) return 'evening_snacks';
  // 20:00–22:30 → dinner_prep
  return 'dinner_prep';
}

function normalizeRecommendation(result) {
  const items = Array.isArray(result) ? result : result?.recommendations || result?.items || [];
  const first = items[0] || result;
  const products = first?.products || first?.items || [];

  if (!products.length) return [];

  const reasonTag = first.reason_tag || first.reasonTag || 'usual_picks';
  // §9 constraint 8: missing confidence treated as 0 — never trust an unscored signal
  const confidence = typeof first.confidence === 'number' ? first.confidence : 0;

  return [{
    signal_type: first.signal_type || 'temporal',
    reason_tag: reasonTag,
    headline: first.headline || headlineForReason(reasonTag),
    confidence,
    products: products.slice(0, 8).map(product => ({
      id: product.id || product.product_id,
      product_id: product.product_id || product.id,
      name: product.name,
      brand: product.brand,
      price: Number(product.price || 0),
      mrp: Number(product.mrp || product.price || 0),
      unit: product.unit,
      image_url: product.image_url || product.imageUrl || '',
      category: product.category || '',
    })),
    streak_count: first.streak_count ?? null,
  }];
}

async function fetchPramarshaRecommendations(userId) {
  const baseUrl = process.env.PRAMARSHA_API_URL;
  if (!baseUrl) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRAMARSHA_TIMEOUT_MS);

  try {
    const now = new Date();
    const url = new URL('/home/recommendations', baseUrl);
    url.searchParams.set('user_id', userId);
    // Pramarsha 2.0 §4.1: send day_type and hour explicitly (server-side, never trust client)
    url.searchParams.set('day_type', (now.getDay() === 0 || now.getDay() === 6) ? 'weekend' : 'weekday');
    url.searchParams.set('hour', now.getHours());
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return [];
    return normalizeRecommendation(await response.json());
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLocalTemporalFallback(userId) {
  const orderStats = await pool.query(`
    SELECT COUNT(*)::int AS order_count
    FROM orders
    WHERE user_id = $1
  `, [userId]);

  if (orderStats.rows[0].order_count < 2) {
    return [];
  }

  const temporalTag = getTemporalReasonTag(new Date());
  const isLateNight = temporalTag === 'late_night_munchies';

  const lateNightUserCategory = isLateNight ? await pool.query(`
    SELECT p.category_id, c.name AS category_name, COUNT(*)::int AS purchase_count
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE o.user_id = $1
      AND (EXTRACT(HOUR FROM o.created_at) * 60 + EXTRACT(MINUTE FROM o.created_at) >= 1350
        OR EXTRACT(HOUR FROM o.created_at) * 60 + EXTRACT(MINUTE FROM o.created_at) < 240)
    GROUP BY p.category_id, c.name
    ORDER BY purchase_count DESC, c.name ASC
    LIMIT 1
  `, [userId]) : { rows: [] };

  const lateNightCohortCategory = isLateNight && !lateNightUserCategory.rows.length ? await pool.query(`
    SELECT p.category_id, c.name AS category_name, COUNT(*)::int AS purchase_count
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE EXTRACT(HOUR FROM o.created_at) * 60 + EXTRACT(MINUTE FROM o.created_at) >= 1350
       OR EXTRACT(HOUR FROM o.created_at) * 60 + EXTRACT(MINUTE FROM o.created_at) < 240
    GROUP BY p.category_id, c.name
    ORDER BY purchase_count DESC, c.name ASC
    LIMIT 1
  `) : { rows: [] };

  const categoryResult = (lateNightUserCategory.rows.length || lateNightCohortCategory.rows.length)
    ? { rows: lateNightUserCategory.rows.length ? lateNightUserCategory.rows : lateNightCohortCategory.rows }
    : await pool.query(`
    SELECT p.category_id, c.name AS category_name, COUNT(*)::int AS purchase_count
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE o.user_id = $1
    GROUP BY p.category_id, c.name
    ORDER BY purchase_count DESC, c.name ASC
    LIMIT 1
  `, [userId]);

  if (!categoryResult.rows.length) return [];

  const category = categoryResult.rows[0];
  const productResult = await pool.query(`
    SELECT
      p.id,
      p.id AS product_id,
      p.name,
      p.price::float AS price,
      COALESCE(p.mrp, p.price)::float AS mrp,
      p.unit,
      p.image_url,
      c.name AS category,
      b.name AS brand,
      COALESCE(ps.final_score, 0.55)::float AS final_score
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_scores ps ON ps.product_id = p.id
    WHERE p.category_id = $1
      AND p.stock_qty > 0
    ORDER BY COALESCE(ps.final_score, 0.55) DESC, p.stock_qty DESC, p.name ASC
    LIMIT 8
  `, [category.category_id]);

  if (!productResult.rows.length) return [];

  return [{
    signal_type: 'temporal',
    reason_tag: temporalTag,
    headline: headlineForReason(temporalTag),
    confidence: 0.5,
    products: productResult.rows,
    category: category.category_name,
    streak_count: null,
  }];
}

/**
 * Cadence signal: calendar-condition based recommendations.
 * Returns sunday_staples (Sat–Sun) or monthly_staples (day 1–5).
 * Confidence 0.65 — higher than temporal (0.5) but lower than replenishment.
 *
 * @param {Array} products - pre-fetched product rows to attach
 * @param {string} categoryName - category name for the recommendation
 * @returns {Object|null} candidate recommendation or null
 */
function fetchCadenceSignal(products, categoryName) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let reasonTag = null;
  if (dayOfMonth >= 1 && dayOfMonth <= 5) {
    reasonTag = 'monthly_staples';
  } else if (isWeekend) {
    reasonTag = 'sunday_staples';
  }

  if (!reasonTag) return null;

  return {
    signal_type: 'cadence',
    reason_tag: reasonTag,
    headline: headlineForReason(reasonTag),
    confidence: 0.65,
    products,
    category: categoryName,
    streak_count: null,
  };
}

/**
 * Replenishment signal: checks user_category_cadence for categories where the user
 * is past their median reorder interval. Returns dairy_restock (if Dairy category)
 * or running_low (any other), with confidence proportional to days overdue.
 *
 * @param {number} userId
 * @returns {Promise<Object|null>} candidate recommendation or null
 */
async function fetchReplenishmentSignal(userId) {
  try {
    // Find the most overdue category for this user
    const result = await pool.query(`
      SELECT
        ucc.category_id,
        c.name AS category_name,
        ucc.median_reorder_days,
        ucc.last_ordered_at,
        ucc.order_count,
        EXTRACT(EPOCH FROM (NOW() - ucc.last_ordered_at)) / 86400.0 AS days_since_last
      FROM user_category_cadence ucc
      JOIN categories c ON c.id = ucc.category_id
      WHERE ucc.user_id = $1
        AND ucc.median_reorder_days > 0
        AND ucc.order_count >= 3
      ORDER BY
        (EXTRACT(EPOCH FROM (NOW() - ucc.last_ordered_at)) / 86400.0) / ucc.median_reorder_days DESC
      LIMIT 1
    `, [userId]);

    if (!result.rows.length) return null;

    const row = result.rows[0];
    const daysSinceLast = Number(row.days_since_last);
    const medianDays = Number(row.median_reorder_days);

    // Only fire if user is at or past their median reorder gap
    if (daysSinceLast < medianDays) return null;

    // Confidence: proportional to how overdue, capped at 0.95
    const confidence = Math.min(0.95, 0.5 + (daysSinceLast / medianDays - 1) * 0.3);

    // Determine reason_tag: dairy_restock for dairy categories, running_low for others
    const isDairy = row.category_name.toLowerCase().includes('dairy');
    const reasonTag = isDairy ? 'dairy_restock' : 'running_low';

    // Fetch top 3 products from the overdue category
    const productResult = await pool.query(`
      SELECT
        p.id,
        p.id AS product_id,
        p.name,
        p.price::float AS price,
        COALESCE(p.mrp, p.price)::float AS mrp,
        p.unit,
        p.image_url,
        c.name AS category,
        b.name AS brand
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.category_id = $1
        AND p.stock_qty > 0
      ORDER BY p.stock_qty DESC, p.name ASC
      LIMIT 3
    `, [row.category_id]);

    if (!productResult.rows.length) return null;

    return {
      signal_type: 'replenishment',
      reason_tag: reasonTag,
      headline: headlineForReason(reasonTag),
      confidence,
      products: productResult.rows,
      category: row.category_name,
      streak_count: null,
    };
  } catch {
    // Graceful — if cadence table doesn't exist yet or query fails, skip this signal
    return null;
  }
}

/**
 * Streak signal: checks user_reason_tag_streaks for the current temporal tag.
 * Fires streak_keeper when the user has ordered during the same reason_tag window
 * on 3+ consecutive matching occasions (per recurrence_type: daily/weekly/monthly).
 *
 * Confidence: 0.6 + min(0.3, streak * 0.05) — designed as a convenience nudge,
 * never dominant. §9 constraint 7: no urgency, no loss-framing.
 *
 * @param {number} userId
 * @param {string} currentReasonTag - the temporal tag for right now
 * @param {Array} products - products to attach
 * @param {string} categoryName - category name
 * @returns {Promise<Object|null>}
 */
async function fetchStreakSignal(userId, currentReasonTag, products, categoryName) {
  try {
    const result = await pool.query(`
      SELECT current_streak, recurrence_type, last_matched_at
      FROM user_reason_tag_streaks
      WHERE user_id = $1 AND reason_tag = $2 AND current_streak >= 3
    `, [userId, currentReasonTag]);

    if (!result.rows.length) return null;

    const { current_streak: streak } = result.rows[0];
    const confidence = 0.6 + Math.min(0.3, streak * 0.05);

    return {
      signal_type: 'streak',
      reason_tag: 'streak_keeper',
      headline: headlineForReason('streak_keeper'),
      confidence,
      products,
      category: categoryName,
      streak_count: streak,
    };
  } catch {
    // Graceful — if streak table doesn't exist yet, skip
    return null;
  }
}

/**
 * Signal scorer (§7.5): picks the single best recommendation from all candidates.
 * Filters by MIN_RECOMMENDATION_CONFIDENCE, sorts by confidence descending,
 * breaks ties by signal priority order (§10).
 *
 * @param {Array<Object|null>} candidates - all collected recommendation candidates
 * @returns {Object} the winning recommendation
 */
function scoreAndPickBestSignal(candidates) {
  const viable = candidates
    .filter(c => c && c.confidence >= MIN_RECOMMENDATION_CONFIDENCE);

  if (!viable.length) return null;

  viable.sort((a, b) => {
    // Primary: highest confidence first
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    // Tie-break: signal priority order (lower index = higher priority)
    return SIGNAL_PRIORITY.indexOf(a.signal_type) - SIGNAL_PRIORITY.indexOf(b.signal_type);
  });

  return viable[0];
}

/**
 * Weather signal (§7.3): feature-flagged, default OFF.
 * When enabled, would call a weather API and map conditions to rainy_day_comfort / heatwave_cooldown.
 * Currently stubbed — returns null. No weather vendor has been selected yet (§9 constraint 9).
 *
 * TODO: Wire up weather API once vendor is selected. See §12 Q1.
 *
 * @param {Array} products - products to attach if signal fires
 * @param {string} categoryName
 * @returns {Object|null}
 */
function fetchWeatherSignal(products, categoryName) {
  if (!WEATHER_SIGNAL_ENABLED) return null;

  // TODO: Replace this stub with actual weather API call.
  // Map conditions:
  //   rain/thunderstorm → rainy_day_comfort (confidence 0.55)
  //   temp above seasonal threshold → heatwave_cooldown (confidence 0.55)
  // For now, always returns null even when enabled — no weather data source.
  return null;
}

/**
 * Event/occasion signal (§7.4): feature-flagged, default OFF.
 * Reads festivalCalendar.json and fires festival_essentials when today is within
 * lead_days of a festival. matchday_snacks has no trigger (no sports data source).
 *
 * @param {Array} products - products to attach if signal fires
 * @param {string} categoryName
 * @returns {Object|null}
 */
function fetchEventSignal(products, categoryName) {
  if (!EVENT_SIGNAL_ENABLED) return null;

  const calendar = getFestivalCalendar();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const todayMs = now.getTime();

  for (const festival of calendar) {
    let festivalDateStr;
    if (festival.type === 'fixed') {
      festivalDateStr = `${year}-${festival.date}`;
    } else if (festival.year_dates && festival.year_dates[String(year)]) {
      festivalDateStr = `${year}-${festival.year_dates[String(year)]}`;
    } else {
      continue;
    }

    const festivalDate = new Date(festivalDateStr);
    if (isNaN(festivalDate.getTime())) continue;

    const daysUntil = (festivalDate.getTime() - todayMs) / (1000 * 60 * 60 * 24);

    if (daysUntil >= 0 && daysUntil <= (festival.lead_days || 3)) {
      return {
        signal_type: 'event',
        reason_tag: 'festival_essentials',
        headline: `Getting ready for ${festival.name}?`,
        confidence: 0.5,
        products,
        category: categoryName,
        streak_count: null,
      };
    }
  }

  return null;
}

export const getHomeRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Try Pramarsha external service first (350ms timeout)
    const external = await fetchPramarshaRecommendations(userId);
    if (external.length) {
      return res.json({ recommendations: external, source: 'pramarsha' });
    }

    // 2. Collect local signal candidates
    const temporalCandidates = await fetchLocalTemporalFallback(userId);
    const temporalRec = temporalCandidates[0] || null;

    // Cold-start: if temporal fallback returned empty (order_count < 2), nothing to score
    if (!temporalRec) {
      return res.json({ recommendations: [], source: 'local_temporal_fallback' });
    }

    const replenishmentRec = await fetchReplenishmentSignal(userId);
    const cadenceRec = fetchCadenceSignal(temporalRec.products, temporalRec.category);
    const streakRec = await fetchStreakSignal(userId, temporalRec.reason_tag, temporalRec.products, temporalRec.category);
    const weatherRec = fetchWeatherSignal(temporalRec.products, temporalRec.category);
    const eventRec = fetchEventSignal(temporalRec.products, temporalRec.category);

    // 3. Score and pick the best signal
    const best = scoreAndPickBestSignal([replenishmentRec, weatherRec, eventRec, cadenceRec, streakRec, temporalRec]);

    // 4. If scorer returns nothing (all below threshold), fall back to usual_picks
    const recommendation = best || {
      signal_type: 'temporal',
      reason_tag: 'usual_picks',
      headline: headlineForReason('usual_picks'),
      confidence: 0.5,
      products: temporalRec.products,
      category: temporalRec.category,
      streak_count: null,
    };

    res.json({
      recommendations: [recommendation],
      source: 'local_temporal_fallback',
    });
  } catch (error) {
    next(error);
  }
};
