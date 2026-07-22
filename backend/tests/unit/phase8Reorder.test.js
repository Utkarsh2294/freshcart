import { describe, expect, it } from 'vitest';

function rankByCadence(history, nowDay) {
  return history
    .map(item => {
      const gaps = item.days.slice(1).map((day, index) => day - item.days[index]);
      const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, gaps.length);
      const dueDelta = Math.abs((nowDay - item.days.at(-1)) - avgGap);
      return { id: item.id, dueDelta };
    })
    .sort((a, b) => a.dueDelta - b.dueDelta)
    .map(item => item.id);
}

describe('predictive reorder cadence', () => {
  it('changes suggestions for different synthetic histories', () => {
    const weeklyMilk = [
      { id: 'milk', days: [1, 8, 15, 22] },
      { id: 'rice', days: [1, 31] },
    ];
    const monthlyRice = [
      { id: 'milk', days: [1, 2, 3, 4] },
      { id: 'rice', days: [1, 31, 61, 91] },
    ];

    expect(rankByCadence(weeklyMilk, 29)[0]).toBe('milk');
    expect(rankByCadence(monthlyRice, 121)[0]).toBe('rice');
  });
});
