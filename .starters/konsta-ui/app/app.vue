<script setup lang="ts">
import { kApp, useTheme } from 'konsta/vue'

const theme = useTheme()
const colorMode = useColorMode()

const inIFrame = computed(() => {
  if (import.meta.env.SSR) return false
  return window.parent !== window
})
</script>

<template>
  <k-app
    :theme="theme"
    :safe-areas="!inIFrame"
    :dark="colorMode.value === 'dark'"
  >
    <NuxtPage />
  </k-app>
</template>
