import { existsSync } from 'node:fs'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '..//layer/modules/config',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  hooks: {
    'build:before'() {
      if (!existsSync('ios/App/App/capacitor.config.json')) {
        console.warn('ios/App/App/capacitor.config.json not found. Add using npx cap add ios')
      }

      if (!existsSync('android/app/src/main/assets/capacitor.config.json')) {
        console.warn('android/app/src/main/assets/capacitor.config.json not found. Add using npx cap add android')
      }

      if (!existsSync('electron/capacitor.config.json')) {
        console.warn('electron/capacitor.config.json not found. Add using npx cap add electron')
      }
    },
    'nuxt-capacitor:config'(options) {
      console.log('nuxt-capacitor:config', options)
    },
  },
  capacitor: {
    config: {
      appId: 'com.example.playground',
      appName: 'Nuxt Capacitor Playground',
      // this is required for the electron community plugin to read the config
      electron: { },
    },
  },
})
