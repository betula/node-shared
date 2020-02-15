module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
		"project": "tsconfig.json",
		"tsconfigRootDir": ".",
	},
  "plugins": ["@typescript-eslint"],
  "rules": {
    "quotes": ["error", "double"],
    "no-empty": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/await-thenable": 0,
    "@typescript-eslint/no-use-before-define": 0
  },
};
