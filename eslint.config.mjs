import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

const ignores = ['./playground/ios/**', './playground/android/**', './playground/electron/**', './.starters/**']

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
}).append(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
).prepend([{ ignores }])
