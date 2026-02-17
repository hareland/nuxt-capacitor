# nuxt-capacitor

A simple nuxt module / layer to automatically generate capacitor.config.ts and dev server injection.

## Install
```bash
pnpx nuxi@latest module add nuxt-capacitor
```

or

```bash
pnpm i nuxt-capacitor
```
Add manually to nuxt.config.ts
```ts
export default defineNuxtConfig({
  modules: ['nuxt-capacitor'],
})
```



## Usage

You can configure everything with the `capacitor` key in your `nuxt.config.ts`.
```ts
export default defineNuxtConfig({
  capacitor: {
    config: {
      appId: 'com.example.playground',
      appName: 'Nuxt Capacitor Playground',
    },
  },
})
```

> NOTE: when you run the dev command, the dev server location is injected automagically into the capacitor.config.ts


## Config
The module automatically generates the `capacitor.config.ts` file in the root of your project, if you do not have it already.