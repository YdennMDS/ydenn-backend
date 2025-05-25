module.exports = {
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["api/**/*.js", "!**/node_modules/**", "!**/vendor/**"],
  coverageDirectory: "coverage",
  testPathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["./__tests__/setup.js"],
};
