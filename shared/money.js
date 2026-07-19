/**
 * Freshcart Money Utility
 * All money math uses integer paise (1/100 of a rupee) internally
 * to avoid floating-point precision issues.
 * Public API accepts and returns rupee strings like "99.50".
 */

/** Convert rupees (number or string) to integer paise. */
export function toPaise(rupees) {
  const n = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (Number.isNaN(n)) throw new Error(`Invalid money value: ${rupees}`);
  return Math.round(n * 100);
}

/** Convert integer paise to a rupee number (2 decimal places). */
export function toRupees(paise) {
  return Number((paise / 100).toFixed(2));
}

/** Add two rupee amounts, return rupees. */
export function add(a, b) {
  return toRupees(toPaise(a) + toPaise(b));
}

/** Subtract b from a, return rupees. */
export function subtract(a, b) {
  return toRupees(toPaise(a) - toPaise(b));
}

/** Multiply a rupee amount by a scalar, return rupees. */
export function multiply(amount, factor) {
  return toRupees(Math.round(toPaise(amount) * factor));
}

/** Apply a percentage to an amount (e.g. 10 for 10%), return rupees. */
export function applyPercentage(amount, percent) {
  return toRupees(Math.round((toPaise(amount) * percent) / 100));
}

/** Round to nearest paise (already integer if using toPaise). */
export function roundToNearestPaise(rupees) {
  return toRupees(toPaise(rupees));
}

/** Format for display: "₹1,234.56" */
export function formatINR(rupees) {
  const n = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
