import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'reports/**',
    '**/*.min.js',
    '.husky/_/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '^node:|^(react|react-dom|three|fs|path)(/|$)|(^|/)(ui|cli)(/|$)',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'localStorage',
        'sessionStorage',
        'performance',
        'setTimeout',
        'setInterval',
        'Date',
        'fetch',
        'process',
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random' },
      ],
    },
  },
);
