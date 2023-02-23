module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  coveragePathIgnorePatterns: [
    '.*\\.d\\.ts',
    'index\\.ts',
    'polyfilled\\.ts',
    'createAction.ts',
    'jest.config.js',
    'webpack.*\\.js',
    './coverage',
    './public',
    '/test-utils',
    '/types',
    // Ignore coverage for ui
    'ui-src',
  ],
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
};
