module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    "plugin:vue/recommended",
    "@vue/eslint-config-typescript"
  ],
  rules: {
    semi: ["error", "never"],
    "no-console": "warn",
    "no-debugger": "error",
    quotes: ["error", "single"],
    "vue/script-indent": "error",
    "vue/component-definition-name-casing": ["error", "PascalCase"],
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/html-indent": ["error", 2],
    "vue/script-indent": ["error", 2],
    "vue/multi-word-component-names": "off",
    "vue/no-v-text-v-html-on-component": "off",
    "prefer-rest-params": "off",
  },
  parserOptions: {
    parser: "@typescript-eslint/parser"
  }
}
