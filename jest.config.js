const path = require('path')
const {pathsToModuleNameMapper} = require("ts-jest");
const {compilerOptions} = require('./tsconfig.json');
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    "transformIgnorePatterns": [
        "node_modules/(?!isomorphic-git)"
    ],

    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/src/'}),
        "^webextension-polyfill$":
            path.join(process.cwd(), "src", "__mocks__", "runtime.ts"),
        '\\.(css|scss)$':
            path.join(process.cwd(), "src", "__mocks__", "styleMock.js"),
    }
}