const path = require('path')
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    "^webextension-polyfill$": path.join(process.cwd(), "src", "__mocks__", "runtime.ts"),
    '\\.(css|scss)$': path.join(process.cwd(), "src", "__mocks__", "styleMock.js"),
  }
};