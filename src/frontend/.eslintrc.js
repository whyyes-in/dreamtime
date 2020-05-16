module.exports = {
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    '@dreamnet/eslint-config-dreamnet',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
  },
  rules: {
    'vue/html-self-closing': ['warn', {
      html: {
        void: 'always',
        normal: 'never',
        component: 'always',
      },
      svg: 'always',
      math: 'always',
    }],
  },
}
