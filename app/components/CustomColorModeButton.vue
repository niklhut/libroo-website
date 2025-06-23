<script lang="ts" setup>
const colorMode = useColorMode()
const isDropdownOpen = ref(false)

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val: boolean) => {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

const colorModeOptions = computed(() => [
  {
    id: 'light',
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox' as const,
    checked: colorMode.preference === 'light',
    onSelect: () => {
      colorMode.preference = 'light'
      isDropdownOpen.value = false
    }
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox' as const,
    checked: colorMode.preference === 'dark',
    onSelect: () => {
      colorMode.preference = 'dark'
      isDropdownOpen.value = false
    }
  },
  {
    id: 'auto',
    label: 'System',
    icon: 'i-lucide-monitor',
    type: 'checkbox' as const,
    checked: colorMode.preference === 'system',
    onSelect: () => {
      colorMode.preference = 'system'
      isDropdownOpen.value = false
    }
  }
])
</script>

<template>
  <ClientOnly>
    <!-- Manual trigger -->
    <UButton
      color="neutral"
      variant="link"
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      aria-label="Toggle color mode"
      @click.stop="isDark = !isDark"
      @contextmenu.prevent="isDropdownOpen = true"
    />

    <UDropdownMenu
      v-model:open="isDropdownOpen"
      :items="colorModeOptions"
      :content="{
        align: 'center',
        side: 'bottom',
        sideOffset: 8
      }"
    >
      <!-- Empty trigger since we manually open it -->
      <span class="sr-only">Color Mode Trigger</span>
    </UDropdownMenu>

    <template #fallback>
      <slot name="fallback">
        <div class="size-8" />
      </slot>
    </template>
  </ClientOnly>
</template>
