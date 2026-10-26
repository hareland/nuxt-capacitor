# nuxt-capacitor

A Nuxt module that automatically generates `capacitor.config.json` / `capacitor.config.ts`, injects your dev server URL, and handles asset
generation - so you can focus on building, not configuring.

> **Note:** This module does not install Capacitor or its platform dependencies. You'll need to set those up yourself -
> see [Prerequisites](#prerequisites) below.

---


## Table of Contents
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Setting Up Mobile Platforms](#setting-up-mobile-platforms)
- [Workflow](#workflow)
- [Config Reference](#config-reference)

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

### Other install methods

<details>
<summary>Starter templates</summary>
  
   ### Minimal starter
   ```bash
   pnpm create nuxt@latest -t github:hareland/nuxt-capacitor/.starters/minimal
   ```
    
   ### [Konsta UI](https://konstaui.com/vue) starter
   ```bash
   pnpm create nuxt@latest -t github:hareland/nuxt-capacitor/.starters/konsta-ui
   ```
</details>

<details>
<summary>Install manually</summary>

   ```bash
   pnpm i nuxt-capacitor
   ```
   
   Then add it to your `nuxt.config.ts`:
   
   ```ts
   export default defineNuxtConfig({
     modules: ['nuxt-capacitor'],
   })
   ```
</details>

---


## Before running on Electron

Electron is an npm project in `electron/` (created by `npx cap add electron`). Install it once:

```bash
pnpm i && cd electron && npm i && cd ..
```


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

---

## How It Works

<details>
<summary>Details</summary>
   
   ### Development (`nuxt dev`)
   
   When you run `nuxt dev`, the module:
   
   1. **Runs `nuxt generate`** to produce the initial static assets Capacitor needs
   2. **Runs `npx cap sync`** to copy those assets into your native projects
   3. **Injects your dev server URL** into `capacitor.config.ts` so the native app connects to your local dev server with
      HMR
   
   You don't need to manually run `generate` or `cap sync` to get started - it's all handled on startup.
   
   ### Production (`nuxt build`)
   
   After the build completes, the module automatically runs `npx cap sync` once the public assets are ready (on the
   `nitro:build:public-assets` hook).
   
</details>

---

## Config file

The module generates the Capacitor config from `nuxt.config.ts > capacitor.config` on every `nuxt dev` / `nuxt build` / `nuxt prepare`. The generated file is
self-contained (it does not import from `.nuxt/`), so `npx cap ...` works on a fresh checkout. **Don't edit it and git-ignore it**; change
`nuxt.config.ts` instead.

Choose the format with `output`:

| `output`          | File                    |
|-------------------|-------------------------|
| `json` (default)  | `capacitor.config.json` |
| `ts`              | `capacitor.config.ts`   |
| `js`              | `capacitor.config.js`   |
| `mjs`             | `capacitor.config.mjs`  |

```ts
export default defineNuxtConfig({
  capacitor: {
    output: 'ts',
  },
})
```

If a config file in another format already exists, the module warns because Capacitor only picks one of them.
>NOTE: Electron (`@capacitor-community/electron`) may only read the `json` format.

## Setting Up Mobile Platforms

Once the module is installed and your `capacitor.config.ts` is in place, initialize your mobile platforms:

```bash
npx cap add ios
npx cap add android
```

---

## Workflow

### Development

Start the dev server - asset generation and sync happen automatically:

```bash
pnpm dev
```

To make HMR accessible on device or simulator, expose the dev server over the network:

```bash
pnpm dev --host=0.0.0.0
```

### Run on Device / Simulator

```bash
npx cap run ios
npx cap run android
```

Pass `--live-reload` to enable Nuxt HMR on device:

```bash
npx cap run ios --live-reload
npx cap run android --live-reload
```

Or open the native IDE directly for more control:

```bash
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

---

## Config Reference

| Option     | Type              | Default   | Description                                                                                                 |
|------------|-------------------|-----------|-------------------------------------------------------------------------------------------------------------|
| `output`   | `'json' \| 'ts' \| 'js' \| 'mjs'` | `'json'` | Format of the generated Capacitor config file                                                               |
| `autoSync` | `boolean`         | `true`    | Runs `nuxt generate` + `npx cap sync` automatically on dev start and after production builds                |
| `config`   | `CapacitorConfig` | See below | Passed directly to Capacitor - supports all [Capacitor config options](https://capacitorjs.com/docs/config) |

Default `config` values set by the module:

```ts
export default {
  appId: 'com.example.app',
  appName: 'Nuxt Capacitor',
  webDir: '.output/public', // auto-set from Nuxt output dir
  // In dev mode, also injects:
  server: {
    url: '<devServer.url>',
    cleartext: true,
  }
}
```

Full example:

```ts
export default defineNuxtConfig({
  capacitor: {
    autoSync: true,
    config: {
      appId: 'com.example.myapp',
      appName: 'My App',
      // webDir is set automatically - no need to configure
    },
  },
})
```