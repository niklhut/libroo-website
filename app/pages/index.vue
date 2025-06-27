<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('content').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

defineOgImageComponent('OgImage', {
  title: page.value.seo?.title || page.value.title,
  description: page.value.seo?.description || page.value.description
})

useSeoMeta({
  title: page.value.seo?.title || page.value.title,
  ogTitle: page.value.seo?.title || page.value.title,
  description: page.value.seo?.description || page.value.description,
  ogDescription: page.value.seo?.description || page.value.description
})
</script>

<template>
  <div
    v-if="page"
    class="relative"
  >
    <div class="hidden lg:block">
      <UColorModeImage
        light="/images/light/line-1.svg"
        dark="/images/dark/line-1.svg"
        class="absolute pointer-events-none pb-10 left-0 top-0 object-cover h-[650px]"
      />
    </div>

    <UPageHero
      :description="page.description"
      :links="page.hero.links"
      :ui="{ container: 'md:pt-18 lg:pt-20' }"
    >
      <template #title>
        <MDC
          :value="page.title"
          class="*:leading-11 sm:*:leading-19 max-w-3xl mx-auto"
        />
      </template>

      <template #links>
        <UButton
          v-for="(link, index) in page.hero.links"
          :key="index"
          v-bind="link"
          @click="umTrackEvent('hero', { action: link.label })"
        />
      </template>
    </UPageHero>

    <UPageSection
      :description="page.section.description"
      :features="page.section.features"
      orientation="horizontal"
      :ui="{
        container: 'lg:px-10 2xl:px-20 mx-0 max-w-none md:mr-10',
        features: 'gap-0'
      }"
      reverse
    >
      <template #title>
        <MDC
          :value="page.section.title"
          class="sm:*:leading-11"
        />
      </template>
      <img
        :src="page.section.images.desktop"
        :alt="page.section.title"
        class="hidden lg:block 2xl:hidden left-0 w-full max-w-2xl"
      >
      <img
        :src="page.section.images.mobile"
        :alt="page.section.title"
        class="block lg:hidden 2xl:block 2xl:w-full 2xl:max-w-2xl max-h-[350px]"
      >
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection
      id="features"
      :description="page.features.description"
      :features="page.features.features"
      :ui="{
        title: 'text-left @container relative flex',
        description: 'text-left'
      }"
      class="relative overflow-hidden"
    >
      <div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" />
      <div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" />
      <template #title>
        <MDC
          :value="page.features.title"
          class="*:leading-9"
        />
        <div class="hidden @min-[1020px]:block">
          <UColorModeImage
            light="/images/light/line-2.svg"
            dark="/images/dark/line-2.svg"
            class="absolute top-0 right-0 size-full transform scale-95 @min-[1020px]:translate-x-[90%] @min-[1180px]:translate-x-[80%]"
          />
        </div>
      </template>
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageCTA
      id="notify"
      v-bind="page.cta"
      variant="naked"
      class="overflow-hidden @container"
    >
      <template #title>
        <MDC :value="page.cta.title" />

        <div class="@max-[1280px]:hidden">
          <UColorModeImage
            light="/images/light/line-6.svg"
            dark="/images/dark/line-6.svg"
            class="absolute left-10 -top-10 sm:top-0 h-full"
          />
          <UColorModeImage
            light="/images/light/line-7.svg"
            dark="/images/dark/line-7.svg"
            class="absolute right-0 bottom-0 h-full"
          />
        </div>
      </template>

      <template #links>
        <WaitlistModal
          :title="page.waitlistModal.title"
          :description="page.waitlistModal.description"
        >
          <UButton
            :icon="page.cta.links[0]!.icon"
            :variant="page.cta.links[0]!.variant"
            :label="page.cta.links[0]!.label"
            :size="page.cta.links[0]!.size"
          />
        </WaitlistModal>
      </template>

      <div class="absolute rounded-full dark:bg-primary blur-[250px] size-40 sm:size-50 transform -translate-x-1/2 left-1/2 -translate-y-80" />

      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
