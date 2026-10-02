import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts', 'scripts/**'] },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // The React Compiler is not enabled; react-hook-form's watch() is intentionally used for live previews.
      'react-hooks/incompatible-library': 'off',
    },
  },
];

export default config;
