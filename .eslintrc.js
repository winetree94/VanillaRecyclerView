module.exports = {
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    project: './tsconfig.json'
  },
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    'prettier/prettier': ['error', {
      "endOfLine":"auto"
    }],
    quotes: ['error', 'single'],
  }
};