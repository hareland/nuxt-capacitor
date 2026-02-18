import { existsSync } from 'node:fs'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  hooks: {
    'build:before'() {
      if (!existsSync('ios/App/App/capacitor.config.json')) {
        console.warn('ios/App/App/capacitor.config.json not found. Add using npx cap add ios')
      }
    },
  },
  capacitor: {
    config: {
      appId: 'com.example.playground',
      appName: 'Nuxt Capacitor Playground',
      // this is required for the electron community plugin to read the config
      electron: {},
    },
  },
})
