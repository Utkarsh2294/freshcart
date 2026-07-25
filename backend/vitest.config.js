import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/vitest-setup.js'],
    // Run unit tests first, then integration
    sequence: {
      hooks: 'list',
    },
  },
});
