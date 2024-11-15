<script setup lang="ts">
import { Motion } from 'motion-vue'
</script>

<template>
  <Motion
    class="bg-primary w-1/3 aspect-square rounded-2xl"
    :initial="{ scale: 0 }"
    :animate="{ rotate: 180, scale: 1 }"
    :transition="{
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.3,
    }"
  />
</template>
