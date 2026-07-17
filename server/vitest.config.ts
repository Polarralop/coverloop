import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Tests live next to the code they cover: src/**/*.test.ts
  },
});
