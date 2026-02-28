/* eslint-disable */
const { readFileSync } = require("fs");

const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, "utf-8"),
);

swcJestConfig.swcrc = false;

module.exports = {
  displayName: "fiap-13soat-auto-repair-shop-app-e2e",
  globalSetup: "<rootDir>/src/support/global-setup.ts",
  globalTeardown: "<rootDir>/src/support/global-teardown.ts",
  setupFiles: ["<rootDir>/src/support/test-setup.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "test-output/jest/coverage",
};
