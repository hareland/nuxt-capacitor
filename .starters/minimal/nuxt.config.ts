// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-capacitor'],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  capacitor: {
    config: {
      appId: process.env.CAPACITOR_APP_ID || 'com.example.nuxtcapacitorminimal',
      appName: process.env.CAPACITOR_APP_NAME || 'Nuxt Capacitor',
    },
  },
})
