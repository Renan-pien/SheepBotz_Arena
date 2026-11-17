import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          include: ['tests/{core,cli,scripts,runtime}/**/*.test.ts'],
          environment: 'node',
          pool: 'forks',
        },
      },
      {
        test: {
          name: 'ui',
          include: ['tests/ui/**/*.test.tsx'],
          environment: 'jsdom',
        },
      },
    ],
    reporters: [
      'default',
      ['json', { outputFile: 'reports/test-results.json' }],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts'],
      exclude: ['src/ui/main.tsx', 'src/cli/index.ts', 'src/core/types.ts'],
      reportOnFailure: true,
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
        'src/core/**': {
          lines: 90,
          statements: 90,
          functions: 90,
          branches: 90,
        },
      },
    },
  },
});
