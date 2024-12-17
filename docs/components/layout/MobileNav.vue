<script setup lang="ts">
import { Motion } from 'motion-v'

const open = ref(false)

// Close sheet on navigation
</script>

<template>
  <UiSheet
    v-model:open="open"
    side="right"
  >
    <UiSheetContent
      side="right"
      class="pr-0"
      :closeable="false"
    >
      <LayoutHeaderLogo />
      <LayoutAside
        is-mobile
        @close="open = false"
      />
    </UiSheetContent>
    <UiButton
      variant="ghost"
      size="icon"
      class="md:hidden pointer-events-auto z-[1000] fixed bottom-4 rounded-full bg-primary/95 text-primary-foreground right-8"
      @click="open = !open"
    >
      <Motion
        as="svg"
        width="23"
        height="18"
        viewBox="0 0 23 18"
        :animate="open ? 'open' : 'closed'"
      >
        <Motion
          id="test"
          as="path"
          class="top"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          :variants="{
            closed: { d: 'M 2 2.5 L 20 2.5' },
            open: { d: 'M 3 16.5 L 17 2.5' },
          }"
          :initial="false"
        />
        <Motion
          id="test2"
          as="path"
          d="M 2 9.423 L 20 9.423"
          class="middle"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          :variants="{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }"
        />
        <Motion
          as="path"
          d="M 2 16.346 L 20 16.346"
          class="bottom"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          :variants="{
            closed: { d: 'M 2 16.346 L 20 16.346' },
            open: { d: 'M 3 2.5 L 17 16.346' },
          }"
        />
      </Motion>
    </UiButton>
  </UiSheet>
</template>
