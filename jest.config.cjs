const {
  TS_JEST_TRANSFORM,
  MODULE_FILE_EXTENSIONS,
  createAliasMapper,
} = require('./jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: MODULE_FILE_EXTENSIONS,
  rootDir: 'src',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: createAliasMapper('<rootDir>/', { stripSrcPrefix: true }),
  transform: {
    '^.+\\.(t|j)s$': TS_JEST_TRANSFORM,
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};