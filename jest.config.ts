import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.ts'],
  moduleNameMapper: {
    '^@shared/firebase$': '<rootDir>/packages/shared/firebase/src/index.ts',
    '^@shared/logger$': '<rootDir>/packages/shared/logger/src/index.ts',
    '^@shared/errors$': '<rootDir>/packages/shared/errors/src/index.ts',
    '^@shared/auth-middleware$': '<rootDir>/packages/shared/auth-middleware/src/index.ts',
    '^@shared/events$': '<rootDir>/packages/shared/events/src/index.ts',
    '^@shared/internal-http-client$': '<rootDir>/packages/shared/internal-http-client/src/index.ts',
    '^@shared/response$': '<rootDir>/packages/shared/response/src/index.ts',
    '^@shared/health$': '<rootDir>/packages/shared/health/src/index.ts',
    '^@shared/tracing$': '<rootDir>/packages/shared/tracing/src/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/**/src/index.ts',
    '!packages/**/src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
