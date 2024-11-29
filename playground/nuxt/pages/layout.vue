<script setup lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const isExpanded = ref(false)
const showFirst = ref(true)
</script>

<template>
  <div class="flex flex-col p-8 h-screen">
    <!-- Basic Layout Animation -->
    <div class="space-y-4">
      <button @click="isExpanded = !isExpanded">
        {{ isExpanded ? 'Shrink' : 'Expand' }}
      </button>
      <Motion
        :layout="true"
        class="bg-purple-500 rounded-2xl h-20"
        :style="{ width: isExpanded ? '300px' : '100px' }"
      />
    </div>

    <!-- Shared Layout Animation -->
    <div class="space-y-4">
      <button @click="showFirst = !showFirst">
        Switch Position
      </button>
      <div class="flex justify-between w-[300px]">
        <Motion
          v-if="showFirst"
          :layout="true"
          layout-id="shared-box"
          class="bg-primary rounded-2xl w-20 h-20"
        />
        <Motion
          v-else
          :layout="true"
          layout-id="shared-box"
          class="bg-primary rounded-2xl w-20 h-20 ml-auto"
        />
      </div>
    </div>
  </div>
</template>
