<script setup lang="ts">
const { proxy } = useScriptUmamiAnalytics()

const items = [
  {
    label: 'Imprint',
    to: '/imprint',
    onclick: () => proxy.track('footer', { action: 'imprint' })
  },
  {
    label: 'Privacy Policy',
    to: '/privacy',
    onclick: () => proxy.track('footer', { action: 'privacy' })
  },
  {
    label: 'Terms of Service',
    to: '/terms',
    onclick: () => proxy.track('footer', { action: 'terms' })
  }
]

function onClick() {
  proxy.track('footer', { action: 'github' })
}
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
        @click="onClick"
      />
    </template>
  </UFooter>
</template>
