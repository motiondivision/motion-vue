<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    :initial="{ opacity: 0, scale: 0.96 }"
    :animate="{ opacity: 1, scale: 1 }"
    :exit="{ opacity: 0, scale: 0.96 }"
    :transition="{ duration: 0.28 }"
    class="rounded-xl border border-white/10 bg-white/[0.06] px-6 py-4 text-sm text-white/75"
  >
    Panel A
  </Motion>
</template>
