<script setup lang="ts">
import { motion } from 'motion-v'
import { ref } from 'vue'

const isExpanded = ref(false)

function handleAnimationComplete() {
  console.log('animation complete')
}

function handleAnimationStart() {
  console.log('animation start')
}
</script>

<template>
  <div class="flex flex-col space-y-4 items-center justify-center p-8 h-screen">
    <button @click="isExpanded = !isExpanded">
      {{ isExpanded ? 'Shrink' : 'Expand' }}
    </button>

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
      @animation-start="handleAnimationStart"
      @animation-complete="handleAnimationComplete"
    />
  </div>
</template>
