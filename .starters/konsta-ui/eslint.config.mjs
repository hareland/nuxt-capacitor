// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
  .override('nuxt/vue/setup', {
    rules: {
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  })
  .append([{ ignores: ['./ios/**','./android/**', './electron/**'] }])
