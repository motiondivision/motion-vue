<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    class="bg-primary w-1/3 aspect-square rounded-2xl"
    :initial="{ scale: 0 }"
    :in-view="{ rotate: 180, scale: 1 }"
    :in-view-options="{
      once: true,
    }"
    :transition="{
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.3,
    }"
  />
</template>
