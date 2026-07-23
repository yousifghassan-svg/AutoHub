/* eslint-env node */
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('node:path');

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
    rules: {
      // Align with existing codebase style; tighten in a dedicated lint sprint.
      '@typescript-eslint/array-type': 'off',
    },
  },
];
