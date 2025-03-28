<script setup lang="ts">
import { motion } from 'motion-v'
import { ref } from 'vue'

const isExpanded = ref(false)
</script>

<template>
  <div class="flex flex-col space-y-4 items-center justify-center p-8 h-screen">
    <button @click="isExpanded = !isExpanded">
      {{ isExpanded ? 'Shrink' : 'Expand' }}
    </button>
    <Motion
      as="a"
      href="https://www.google.com"
    >
      123
    </Motion>
    <motion.button
      :layout="true"
      :initial="{ borderRadius: '12px' }"
      class="bg-purple-500  h-20"
      :style="{ width: isExpanded ? '300px' : '100px' }"
      tabindex="-1"
      :transition="{
        layout: {
          type: 'spring',
          stiffness: 100,
          damping: 10,
        },
      }"
    />
  </div>
</template>
