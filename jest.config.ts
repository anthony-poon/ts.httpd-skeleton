import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "moduleNameMapper": {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@client/(.*)$": "<rootDir>/src/client/$1",
    "^@env$": "<rootDir>/src/env",
    "^@entity/(.*)$": "<rootDir>/src/persistence/entity/$1",
    "^@repository/(.*)$": "<rootDir>/src/persistence/repository/$1",
    "^@database$": "<rootDir>/src/persistence",
    "^@service/(.*)$": "<rootDir>/src/http/service/$1",
  },
};

export default config;