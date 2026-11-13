const { FlatCompat } = require('@eslint/eslintrc');
const path = require('node:path');

const appDirectory = path.join(__dirname, 'apps', 'miniapp');
const compatibility = new FlatCompat({
  baseDirectory: appDirectory,
  resolvePluginsRelativeTo: appDirectory,
});

module.exports = [
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/coverage/**', '**/playwright-report/**', '**/test-results/**'] },
  { files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'] },
  ...compatibility.extends('next/core-web-vitals'),
];
