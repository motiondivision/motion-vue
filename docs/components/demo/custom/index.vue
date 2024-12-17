<script setup lang="ts">
import { Motion } from 'motion-v'
import type { Variant } from 'motion-v'

const variants: Record<string, Variant | ((custom: number) => Variant)> = {
  invisible: {
    opacity: 0,
    y: 20,
  },
  visible: custom => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.3, ease: 'easeInOut', duration: 0.4 },
  }),
}
</script>

<template>
  <Motion
    as="ul"
    initial="invisible"
    animate="visible"
    class="space-y-4 w-1/2"
  >
    <Motion
      v-for="i in 3"
      :key="i"
      as="li"
      :custom="i - 1"
      :variants="variants"
      class="h-10 bg-primary rounded-lg "
    />
  </Motion>
</template>
