module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  setupFilesAfterEnv: [ "<rootDir>/jest.setupAfterEnv.js" ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testMatch: [ "**/*.test.ts" ],
  moduleNameMapper: {
    "@(services/.*)$": "<rootDir>/$1"
  },
  testPathIgnorePatterns: [ '<rootDir>/.dist/', '<rootDir>/node_modules/' ],
  moduleFileExtensions: ["ts", "js", "json"],
  testEnvironment: "node",
  verbose: true
};
