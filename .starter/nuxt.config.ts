// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-capacitor'],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  capacitor: {
    config: {
      appId: 'com.text.app',
      appName: 'Text App',
      webDir: '.output/public',
    },
  },
})
