module.exports = {
  setupFilesAfterEnv: [ "node-provide/jest-cleanup-after-each" ],
  testMatch: [ "**/*.test.ts" ],
  moduleNameMapper: {
    "@(services/.*)$": "<rootDir>/$1"
  },
  testPathIgnorePatterns: [ '<rootDir>/.dist/', '<rootDir>/node_modules/' ],
  moduleFileExtensions: ["ts", "js", "json"],
  testEnvironment: "node",
  verbose: true
};
