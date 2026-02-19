<script setup lang="ts">
// Konsta UI components
import {
  kPage,
  kNavbar,
  kBlock,
  kButton,
  kBlockTitle,
} from 'konsta/vue'

const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

</script>

<template>
  <k-page>
    <k-navbar title="My App" large/>

    <k-block strong>
      <p>Here is your Nuxt & Konsta UI app. Let's see what we have here.</p>
    </k-block>
    <k-block-title>Navigation</k-block-title>

    <k-block
        strong
        class="flex space-x-4"
    >
      <k-button @click="toggleColorMode">
        Theme
      </k-button>
      <k-button @click="colorMode.preference = 'system'">
        System Theme
      </k-button>
    </k-block>
  </k-page>
</template>
