<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef = ref<HTMLDivElement>()
const releaseCount = ref(0)

function onDragEnd() {
  releaseCount.value++
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">
      dragSnapToConstraints
    </h1>
    <p class="text-sm text-gray-600 mb-4">
      Release inside the container and the box animates to the nearer edge.
    </p>

    <div
      ref="containerRef"
      data-testid="snap-to-constraints-container"
      class="relative bg-gray-100 rounded"
      style="width: 736px; height: 400px;"
    >
      <motion.div
        :drag="true"
        :drag-constraints="containerRef"
        :drag-snap-to-constraints="true"
        :drag-momentum="false"
        class="absolute w-32 h-32 bg-primary-500 rounded-lg cursor-grab active:cursor-grabbing select-none"
        style="top: 136px; left: 304px;"
        data-testid="snap-to-constraints-box"
        @drag-end="onDragEnd"
      />
    </div>

    <p class="mt-4 text-sm text-gray-600">
      Release count: {{ releaseCount }}
    </p>
  </div>
</template>
