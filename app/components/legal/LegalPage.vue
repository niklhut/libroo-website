<script setup lang="ts">
type LegalPageKind = 'imprint' | 'privacy'
type LegalPlaceholderMap = Record<string, string>

interface LegalMarkdownBody extends Record<string, unknown> {
  type: 'root'
  children: never[]
}

interface LegalDocumentResponse {
  type: 'redirect' | 'markdown' | 'unconfigured'
  title: string
  url?: string
  body?: LegalMarkdownBody
  data?: Record<string, unknown>
  hasPlaceholders?: boolean
  placeholders?: LegalPlaceholderMap
  markdownLength?: number
}

const props = defineProps<{
  page: LegalPageKind
}>()

const legalMarkdownElement = ref<HTMLElement | null>(null)
const placeholderMarkerPrefix = 'LEGAL_PLACEHOLDER_'
const placeholderMarkerPattern = /LEGAL_PLACEHOLDER_([A-Z0-9_]+)/g
let placeholderFetchPromise: Promise<LegalPlaceholderMap> | undefined

const { data: document, error } = await useFetch<LegalDocumentResponse>(`/api/legal/${props.page}`, {
  key: `legal-${props.page}`,
  query: import.meta.client
    ? { includePlaceholders: '1' }
    : undefined
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage || 'Could not load legal page.',
    fatal: true
  })
}

if (document.value?.type === 'redirect' && document.value.url) {
  await navigateTo(document.value.url, {
    external: true,
    redirectCode: 302
  })
}

const title = computed(() => document.value?.title || 'Legal')
const hasPlaceholders = computed(() => Boolean(document.value?.hasPlaceholders))

function loadPlaceholders() {
  if (document.value?.placeholders) {
    return Promise.resolve(document.value.placeholders)
  }

  placeholderFetchPromise ||= $fetch<LegalPlaceholderMap>('/api/legal/placeholders')
    .catch(() => {
      placeholderFetchPromise = undefined
      return {}
    })

  return placeholderFetchPromise
}

function replacePlaceholderMarkers(node: Node, placeholders: LegalPlaceholderMap) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(placeholderMarkerPrefix)) {
    node.textContent = node.textContent.replace(placeholderMarkerPattern, (_match, key: string) => {
      return placeholders[key] || ''
    })

    return
  }

  node.childNodes.forEach(childNode => replacePlaceholderMarkers(childNode, placeholders))
}

function fillPlaceholderElements(element: HTMLElement, placeholders: LegalPlaceholderMap) {
  const placeholderElements = element.querySelectorAll<HTMLElement>('[data-legal-placeholder]')

  placeholderElements.forEach((placeholderElement) => {
    const key = placeholderElement.dataset.legalPlaceholder

    placeholderElement.textContent = key ? placeholders[key] || '' : ''
  })

  return placeholderElements.length > 0
}

async function fillPlaceholders() {
  if (!hasPlaceholders.value) {
    return
  }

  const placeholders = await loadPlaceholders()

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await nextTick()

    if (legalMarkdownElement.value && fillPlaceholderElements(legalMarkdownElement.value, placeholders)) {
      return
    }

    if (legalMarkdownElement.value?.textContent?.includes(placeholderMarkerPrefix)) {
      replacePlaceholderMarkers(legalMarkdownElement.value, placeholders)
      return
    }

    await new Promise(resolve => window.requestAnimationFrame(resolve))
  }
}

onMounted(() => {
  void fillPlaceholders()
})

watch(() => document.value?.body, () => {
  void fillPlaceholders()
}, { flush: 'post' })

useSeoMeta({
  title,
  ogTitle: title,
  robots: 'noindex'
})
</script>

<template>
  <UPage>
    <UPageSection
      :ui="{
        container: 'max-w-3xl py-16 sm:py-24'
      }"
    >
      <div
        v-if="document?.type === 'markdown' && document.body"
        ref="legalMarkdownElement"
        class="legal-markdown"
      >
        <MDCRenderer
          :key="`${props.page}-${document.markdownLength || 0}`"
          :body="document.body"
          :data="document.data"
        />
      </div>

      <p
        v-else-if="document?.type === 'unconfigured'"
        class="text-muted"
      >
        This page has not been configured for this deployment.
      </p>
    </UPageSection>
  </UPage>
</template>
