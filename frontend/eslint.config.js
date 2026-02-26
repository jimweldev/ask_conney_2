import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import eslintComments from 'eslint-plugin-eslint-comments';
import pluginPrettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'src/components/ui']),
  {
    files: ['**/*.{ts,tsx,jsx,js}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      prettier: pluginPrettier,
      react,
      'react-hooks': reactHooks,
      'eslint-comments': eslintComments,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      'react-refresh/only-export-components': 'off',
      'eslint-comments/require-description': ['error', { ignore: [] }],

      // Add react-hooks rules manually
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      /**
       * Allow arrow functions only
       */
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'no-new-func': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      /**
       * Enforce clean JSX syntax
       * Disallow `{ 'string' }` when `'string'` works
       */
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'ignore' },
      ],
    },
  },
]);
