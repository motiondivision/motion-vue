<script setup lang="ts">
import { Motion } from 'motion-vue'
</script>

<template>
  <Motion
    :hover="{ scale: 1.2, rotate: 90 }"
    :press="{
      scale: 0.8,
      rotate: -90,
      borderRadius: '100%',
    }"
    :transition="{
      type: 'spring',
      stiffness: 260,
      damping: 20,

    }"
    as="button"
    class="rounded-2xl overflow-hidden  list-none p-2  grid-cols-2 grid-rows-2 aspect-square bg-primary w-1/3  grid"
  />
</template>
