<script setup lang="ts">
import { motion } from 'motion-v'
</script>

<template>
  <motion.div
    class="inline-grid grid-cols-2 gap-2"
    initial="hidden"
    hover="visible"
    :transition="{
      staggerChildren: 0.2,
    }"
  >
    <motion.div
      v-for="i in 4"
      :key="i"
      class="w-20 h-20 bg-red-500"
      :variants="{
        hidden: { opacity: 0, y: 30, rotate: 3 },
        visible: { opacity: 1, y: 0, rotate: 0 },
      }"
    >
      {{ i }}
    </motion.div>
  </motion.div>
</template>
