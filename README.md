# nuxt-capacitor

A Nuxt module / layer that automatically generates `capacitor.config.ts` and injects your dev server URL — so you can focus on building, not configuring.

> **Note:** This module does not install Capacitor or its platform dependencies. You'll need to set those up yourself — see [Prerequisites](#prerequisites) below.

---

## Prerequisites

Before using this module, make sure you have the following installed in your project:

```bash
# Core Capacitor CLI and runtime
pnpm add @capacitor/core @capacitor/cli
```

For mobile platforms, add whichever you need:

```bash
pnpm add @capacitor/ios     # iOS support
pnpm add @capacitor/android # Android support
```

You'll also need:
- [Xcode](https://developer.apple.com/xcode/) (for iOS builds, macOS only)
- [Android Studio](https://developer.android.com/studio) (for Android builds)

---

## Install

The easiest way is via the Nuxt CLI:

```bash
pnpx nuxi@latest module add nuxt-capacitor
```

Or install manually:

```bash
pnpm i nuxt-capacitor
```

Then add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-capacitor'],
})
```

---

## Usage

Configure the module using the `capacitor` key in your `nuxt.config.ts`. At minimum, set your `appId` and `appName`:

```ts
export default defineNuxtConfig({
  capacitor: {
    config: {
      appId: process.env.CAPACITOR_APP_ID || 'com.example.myapp',
      appName: process.env.CAPACITOR_APP_NAME || 'My App',
    },
  },
})
```

> **Dev server injection:** When you run `nuxt dev`, the module automatically injects your local dev server URL into `capacitor.config.ts`, so your native app always points to the right place during development.

---

## How It Works

On startup, the module:

1. **Generates `capacitor.config.ts`** in your project root (if one doesn't already exist)
2. **Injects the dev server URL** into the config when running in dev mode

You don't need to manually manage the server URL — it's handled automatically.

---

## Setting Up Mobile Platforms

Once the module is installed and your `capacitor.config.ts` is in place, initialize your mobile platforms.

### iOS

```bash
npx cap add ios
```

### Android

```bash
npx cap add android
```

---

## Workflow

### Build & Sync

Generate your Nuxt app and sync assets to the native projects:

```bash
pnpm generate && npx cap sync
```

> Run this after any change to your web app to keep the native projects up to date.

### Run on Device / Simulator

```bash
npx cap run ios
npx cap run android
```

Or open the native IDE directly for more control:

```bash
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

---

## Config Reference

All options are passed under the `capacitor.config` key and map directly to [Capacitor's configuration options](https://capacitorjs.com/docs/config).

```ts
export default defineNuxtConfig({
  capacitor: {
    config: {
      appId: 'com.example.myapp',   // Unique app identifier (reverse domain)
      appName: 'My App',            // Display name shown on device
      webDir: '.output/public',     // Nuxt output directory (auto-set)
      // ...any other Capacitor config options
    },
  },
})
```