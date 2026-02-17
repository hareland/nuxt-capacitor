import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  dirs: {
    src: [
      './layer',
    ],
  },
  features: {
    tooling: true,
    stylistic: true,
  },
}, {
  files: [
    'cli/**/*.ts',
  ],
  ignores: ['playground/ios/**'],
}).append(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)
