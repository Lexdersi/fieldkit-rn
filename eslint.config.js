// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const jest = require('eslint-plugin-jest');

module.exports = defineConfig([
  expoConfig,
  {
    // Generated native projects (prebuild) and build output
    ignores: ['dist/*', 'android/*', 'ios/*', 'modules/*/android/*', 'modules/*/ios/*', 'coverage/*'],
  },
  {
    files: ['**/__tests__/**', '**/*-test.{ts,tsx}', 'jest.setup.js'],
    plugins: { jest },
    languageOptions: { globals: jest.environments.globals.globals },
    rules: {
      // Day 15: snapshots stay small enough to review in a diff
      'jest/no-large-snapshots': ['error', { maxSize: 30, inlineMaxSize: 10 }],
    },
  },
]);
