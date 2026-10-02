import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  testRegex: '\\.e2e-spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json', diagnostics: false }] },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/setup-env.ts'],
  globalSetup: '<rootDir>/global-setup.ts',
  testTimeout: 30_000,
};

export default config;
