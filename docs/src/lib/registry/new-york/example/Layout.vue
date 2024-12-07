<script setup lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const isExpanded = ref(false)
const showFirst = ref(true)
</script>

<template>
  <div class="flex flex-col p-8 ">
    <!-- Basic Layout Animation -->
    <div class="space-y-4">
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
  </div>
</template>
