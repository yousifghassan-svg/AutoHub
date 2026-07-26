/* eslint-env node */
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('node:path');
const reactHooks = require('eslint-plugin-react-hooks');

const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
});

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      'eslint.config.js',
      'jest.setup.js',
      'babel.config.js',
      'metro.config.js',
    ],
  },
  ...compat.extends('expo'),
  {
    plugins: {
      // Override eslint-config-expo's react-hooks@4 (incompatible with ESLint 9).
      'react-hooks': reactHooks,
    },
    rules: {
      // Align with existing codebase style; tighten in a dedicated lint sprint.
      '@typescript-eslint/array-type': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
