const { pathsToModuleNameMapper } = require('ts-jest');

const { compilerOptions } = require('./tsconfig.json');

const TS_JEST_TRANSFORM = [
  'ts-jest',
  { tsconfig: 'tsconfig.test.json' },
];

const MODULE_FILE_EXTENSIONS = ['js', 'json', 'ts'];

/**
 * Build Jest moduleNameMapper from tsconfig path aliases.
 *
 * @param {string} prefix - Jest rootDir prefix (e.g. '<rootDir>/', '<rootDir>/../')
 * @param {{ stripSrcPrefix?: boolean }} options
 *   When Jest rootDir is `src/`, strip `./src/` from tsconfig paths so
 *   `<rootDir>/domain/*` resolves correctly.
 */
function createAliasMapper(prefix, { stripSrcPrefix = false } = {}) {
  const paths = compilerOptions.paths ?? {};
  const normalizedPaths = stripSrcPrefix
    ? Object.fromEntries(
        Object.entries(paths).map(([alias, targets]) => [
          alias,
          targets.map((target) => target.replace(/^\.\/src\//, '')),
        ]),
      )
    : paths;

  return pathsToModuleNameMapper(normalizedPaths, { prefix });
}

module.exports = {
  TS_JEST_TRANSFORM,
  MODULE_FILE_EXTENSIONS,
  createAliasMapper,
};