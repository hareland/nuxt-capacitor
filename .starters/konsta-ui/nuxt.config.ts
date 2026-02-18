import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['nuxt-capacitor', '@nuxtjs/color-mode'],
  devtools: { enabled: false },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    classPrefix: '',
    preference: 'system',
    fallback: 'light',
    storage: 'localStorage',
  },
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [
      // @ts-expect-error This is an upstream issue
      tailwindcss(),
    ],
  },
  capacitor: {
    config: {
      appId: process.env.CAPACITOR_APP_ID || 'com.example.nuxtcapacitorkonstaui',
      appName: process.env.CAPACITOR_APP_NAME || 'Nuxt Capacitor',
    },
  },
})
