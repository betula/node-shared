module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
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
