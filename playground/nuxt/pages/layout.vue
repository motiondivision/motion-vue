<script setup lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const isExpanded = ref(false)
</script>

<template>
  <div class="flex flex-col space-y-4 items-center justify-center p-8 h-screen">
    <!-- Basic Layout Animation -->
    <button @click="isExpanded = !isExpanded">
      {{ isExpanded ? 'Shrink' : 'Expand' }}
    </button>
    <Motion
      :layout="true"
      :initial="{ borderRadius: '12px' }"
      class="bg-purple-500  h-20"
      :style="{ width: isExpanded ? '300px' : '100px' }"
    />
  </div>
</template>
