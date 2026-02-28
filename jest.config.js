/* eslint-disable */
const { readFileSync } = require("fs");
const { join } = require("path");

const swcJestConfig = JSON.parse(
  readFileSync(join(__dirname, ".spec.swcrc"), "utf-8"),
);

swcJestConfig.swcrc = false;

module.exports = {
  displayName: "@fiap-13soat-auto-repair-shop/app",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "test-output/jest/coverage",
  testPathIgnorePatterns: ["<rootDir>/e2e/"],
  transformIgnorePatterns: ["node_modules/(?!(@swc|@faker-js)/)"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
