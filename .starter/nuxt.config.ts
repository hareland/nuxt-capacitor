// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-capacitor'],
  capacitor: {
    config: {
      appId: 'com.text.app',
      appName: 'Text App',
      webDir: '.output/public'
    }
  }
})