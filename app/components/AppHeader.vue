<script setup lang="ts">
const nuxtApp = useNuxtApp()
const { activeHeadings, updateHeadings } = useScrollspy()
const { proxy } = useScriptUmamiAnalytics()
const runtimeConfig = useRuntimeConfig()
const appUrl = String(runtimeConfig.public.librooAppUrl || 'https://app.libroo.app').replace(/\/$/, '')
const loginUrl = `${appUrl}/login`

const items = computed(() => [{
  label: 'Features',
  to: '#features',
  active: activeHeadings.value.includes('features') && !activeHeadings.value.includes('pricing'),
  onclick: () => trackHeaderClick('Features')
}])

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    document.querySelector('#features'),
    document.querySelector('#notify')
  ].filter(Boolean) as Element[])
})

const trackHeaderClick = (label: string) => {
  proxy.track('nav_click', {
    source: 'header',
    label
  })
}
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        aria-label="Libroo home"
      >
        <NuxtImg
          src="/Libroo_Icon_Text.png"
          alt="Libroo"
          class="w-32"
          width="128"
        />
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:block"
      />

      <CustomColorModeButton />

      <UButton
        :to="loginUrl"
        target="_blank"
        icon="i-lucide-log-in"
        variant="subtle"
        class="hidden lg:inline-flex"
        @click="trackHeaderClick('Log in')"
      >
        Log in
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
      <UButton
        class="mt-4"
        :to="loginUrl"
        target="_blank"
        label="Log in"
        icon="i-lucide-log-in"
        variant="subtle"
        block
        @click="trackHeaderClick('Log in')"
      />
      <UButton
        class="mt-2"
        :to="appUrl"
        target="_blank"
        label="Open app"
        icon="i-lucide-library"
        color="neutral"
        variant="ghost"
        block
        @click="trackHeaderClick('Open app')"
      />
    </template>
  </UHeader>
</template>
