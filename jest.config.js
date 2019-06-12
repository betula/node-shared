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
  verbose: true
};
