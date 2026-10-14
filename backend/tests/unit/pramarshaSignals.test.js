import { describe, expect, it } from 'vitest';
import { getTemporalReasonTag, scoreAndPickBestSignal } from '../../src/controllers/homeController.js';

function localDate(day, hour, minute = 0) {
  const date = new Date(2026, 9, 12 + day, hour, minute);
  return date;
}

describe('Pramarsha temporal signals', () => {
  it.each([
    [localDate(0, 1, 59), 'late_night_munchies'],
    [localDate(0, 2), 'early_morning_essentials'],
    [localDate(0, 9), 'weekday_breakfast'],
    [localDate(0, 12), 'midday_topup'],
    [localDate(0, 16), 'evening_snacks'],
    [localDate(0, 20), 'dinner_prep'],
    [localDate(0, 22, 30), 'late_night_munchies'],
    [localDate(5, 9), 'weekend_brunch'],
  ])('maps %s to %s', (date, expected) => {
    expect(getTemporalReasonTag(date)).toBe(expected);
  });

  it('uses the documented priority when confidence ties', () => {
    const winner = scoreAndPickBestSignal([
      { signal_type: 'temporal', confidence: 0.7 },
      { signal_type: 'replenishment', confidence: 0.7 },
      { signal_type: 'unknown', confidence: 0.7 },
    ]);
    expect(winner.signal_type).toBe('replenishment');
  });

  it('rejects signals below the confidence floor', () => {
    expect(scoreAndPickBestSignal([{ signal_type: 'temporal', confidence: 0.39 }])).toBeNull();
  });
});
