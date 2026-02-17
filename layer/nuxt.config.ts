import { extendViteConfig, createResolver, useNuxt } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    resolve('./modules/config'),
  ],
  devtools: {
    enabled: true,
  },
  compatibilityDate: '2025-07-22',
})
