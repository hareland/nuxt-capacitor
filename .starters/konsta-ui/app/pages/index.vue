<script setup lang="ts">
// Konsta UI components
import {
  kPage,
  kNavbar,
  kBlock,
  kButton,
  kList,
  kListItem,
  kBlockTitle,
} from 'konsta/vue'

const onButtonClick = (button: string) => () => {
  window.alert(`Button ${button} clicked!`)
}
</script>

<template>
  <k-page>
    <k-navbar title="My App" />

    <k-block strong>
      <p>Here is your Nuxt & Konsta UI app. Let's see what we have here.</p>
    </k-block>
    <k-block-title>Navigation</k-block-title>
    <k-list
      strong
      inset
    >
      <k-list-item
        href="/about/"
        title="About"
      />
      <k-list-item
        href="/form/"
        title="Form"
      />
    </k-list>

    <k-block
      strong
      class="flex space-x-4"
    >
      <k-button @click="onButtonClick('button-1')">
        Button 1
      </k-button>
      <k-button @click="onButtonClick('button-2')">
        Button 2
      </k-button>
    </k-block>
  </k-page>
</template>
