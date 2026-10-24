<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    :initial="{ opacity: 0, scale: 0.96 }"
    :animate="{ opacity: 1, scale: 1 }"
    :exit="{ opacity: 0, scale: 0.96 }"
    :transition="{ duration: 0.28 }"
    class="rounded-xl border border-violet-300/20 bg-violet-400/10 px-6 py-4 text-sm text-violet-100"
  >
    Panel B
  </Motion>
</template>
