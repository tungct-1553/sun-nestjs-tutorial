const {
  TS_JEST_TRANSFORM,
  MODULE_FILE_EXTENSIONS,
  createAliasMapper,
} = require('../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: MODULE_FILE_EXTENSIONS,
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  setupFiles: ['<rootDir>/setup-e2e.ts'],
  moduleNameMapper: createAliasMapper('<rootDir>/../'),
  transform: {
    '^.+\\.(t|j)s$': TS_JEST_TRANSFORM,
  },
};