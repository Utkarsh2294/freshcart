import { describe, expect, it } from 'vitest';
import { resolveInitialDarkMode } from './theme.js';

describe('resolveInitialDarkMode', () => {
  it('uses the system preference until the user chooses a theme', () => {
    expect(resolveInitialDarkMode(null, true)).toBe(true);
    expect(resolveInitialDarkMode(null, false)).toBe(false);
  });

  it('lets the saved user choice override the system preference', () => {
    expect(resolveInitialDarkMode('light', true)).toBe(false);
    expect(resolveInitialDarkMode('dark', false)).toBe(true);
  });
});
