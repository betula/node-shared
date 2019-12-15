module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json",
      diagnostics: {
        warnOnly: true
      }
    }
  },
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testMatch: [
    "**/*.test.ts"
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: [ '<rootDir>/.dist/', '<rootDir>/examples/', '<rootDir>/node_modules/' ],
  verbose: true
};
