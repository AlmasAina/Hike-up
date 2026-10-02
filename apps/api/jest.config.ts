import type { Config } from 'jest';

const config: Config = {
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json', diagnostics: false }] },
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.ts', '!**/*.module.ts', '!main.ts', '!**/*.dto.ts'],
  coverageDirectory: '../coverage',
};

export default config;
