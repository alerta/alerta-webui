module.exports = {
  extends: ['plugin:vue/essential', '@vue/typescript/recommended', 'prettier'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'vue/valid-v-slot': 'off'
  }
}
