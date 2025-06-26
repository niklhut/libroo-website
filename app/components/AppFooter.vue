<script setup lang="ts">
const items = [
  {
    label: 'Imprint',
    to: 'https://niklhut.com/imprint',
    onclick: () => umTrackEvent('footer', { action: 'imprint' })
  },
  {
    label: 'Privacy Policy',
    to: 'https://niklhut.com/privacy',
    onclick: () => umTrackEvent('footer', { action: 'privacy' })
  }
]
</script>

<template>
  <USeparator
    :avatar="{
      src: '/favicon-96x96.png',
      alt: 'Logo'
    }"
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #left>
      <p class="text-sm text-muted">
        Copyright © {{ new Date().getFullYear() }}. All rights reserved.
      </p>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UButton
        icon="simple-icons:github"
        variant="link"
        color="neutral"
        to="https://github.com/niklhut/libroo"
        target="_blank"
        @click="umTrackEvent('footer', { action: 'github' })"
      />
    </template>
  </UFooter>
</template>
