<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const { page } = useContent()
const config = useConfig()
const route = useRoute()
useSeoMeta({
  description: config.value.site.description,
  ogDescription: config.value.site.description,
  twitterCard: 'summary_large_image',
})

useServerHead({
  bodyAttrs: {
  },
})
const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<template>
  <NuxtLoadingIndicator
    class="z-100 bg-primary/80"
  />
  <!-- ClientOnly -->
  <LayoutHeader />
  <LayoutMobileNav v-if="isMobile" />

  <div class="min-h-screen pt-14">
    <div
      v-if="route.path !== '/'"
      class="h-full border-b"
    >
      <div
        class="flex-1 items-start px-4 md:grid md:gap-6 md:px-8 lg:gap-10"
        :class="[
          config.main.padded && 'container',
          (page?.aside ?? true) && 'md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]',
        ]"
      >
        <aside
          v-if="page?.aside ?? true"
          class="fixed top-[102px] z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto md:sticky md:top-[60px] md:block"
        >
          <ClientOnly>
            <LayoutAside :is-mobile="false" />
          </ClientOnly>
        </aside>
        <NuxtPage />
      </div>
    </div>
    <NuxtPage v-else />
  </div>
</template>

<style>
</style>
