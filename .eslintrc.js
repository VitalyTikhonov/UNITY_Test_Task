/* eslint-disable quote-props */
/* eslint-disable quotes */
module.exports = {
  "env": {
    "browser": true,
    "es2020": true,
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "airbnb-base",
  ],
  "parserOptions": {
    "ecmaVersion": 11,
    "sourceType": "module",
  },
  "rules": {
    "no-underscore-dangle": "off",
    // "linebreak-style": ["error", "windows"],

    /* https://eslint.org/docs/rules/object-curly-newline
    сколько максимум свойств объекта можно писать в строку */
    "object-curly-newline": ["error", {
      "ObjectExpression": "always",
      // "ObjectExpression": { "multiline": true, "minProperties": 6 },
      "ObjectPattern": { "multiline": true, "minProperties": 6 },
      "ImportDeclaration": { "multiline": true, "minProperties": 6 },
      "ExportDeclaration": { "multiline": true, "minProperties": 6 },
    }],
    /* https://eslint.org/docs/rules/operator-linebreak */
    "operator-linebreak": { "overrides": { "&&": "after" } },
  },
};
