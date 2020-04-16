module.exports = {
  testMatch: [
    "**/*.test.ts"
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: [ '<rootDir>/.dist/', '<rootDir>/examples/', '<rootDir>/node_modules/' ],
  verbose: true
};
