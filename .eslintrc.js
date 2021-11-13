module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    "plugin:vue/recommended",
    "@vue/typescript"
  ],
  rules: {
    semi: ["error", "never"],
    "no-console": "warn",
    "no-debugger": "error",
    quotes: ["error", "single"],
    "vue/script-indent": "error",
    "vue/name-property-casing": ["error", "PascalCase"],
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/html-indent": ["error", 2],
    "vue/script-indent": ["error", 2],
  },
  parserOptions: {
    parser: "typescript-eslint-parser"
  }
}
