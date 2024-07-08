const path = require('path')
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
   "transformIgnorePatterns": [
      "node_modules/(?!isomorphic-git)"
    ],

  moduleNameMapper: {
    '^@/(.*)' : '<rootDir>/src/$1',
    "^webextension-polyfill$": path.join(process.cwd(), "src", "__mocks__", "runtime.ts"),
    '\\.(css|scss)$': path.join(process.cwd(), "src", "__mocks__", "styleMock.js"),
  }
};