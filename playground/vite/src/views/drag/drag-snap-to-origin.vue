<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef = ref<HTMLDivElement>()

const dragCount = ref(0)
const snapBackCount = ref(0)

function onDragStart() {
  dragCount.value++
}

function onDragEnd() {
  snapBackCount.value++
}
</script>

<template>
  <div class="p-8">
    <div class="space-y-8">
      <div class="border p-4 rounded">
        <h1 class="text-2xl font-bold mb-4">
          dragSnapToOrigin Test
        </h1>
        <p class="text-sm text-gray-600 mb-4">
          Test that elements with dragSnapToOrigin properly snap back to origin,
          and that clicking during the snap-back animation doesn't interrupt it.
        </p>
      </div>

      <!-- Test: dragSnapToOrigin basic behavior -->
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">
          Test: dragSnapToOrigin
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          Drag the box anywhere and release. It should snap back to origin (0,0).
          Clicking during the snap-back animation should not interrupt it.
        </p>

        <div
          ref="containerRef"
          class="relative bg-gray-100 rounded"
          style="width: 400px; height: 300px;"
        >
          <motion.div
            :drag="true"
            :drag-snap-to-origin="true"
            :initial="{ x: 0, y: 0 }"
            class="absolute w-20 h-20 bg-blue-500 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold select-none"
            style="top: 0; left: 0;"
            data-testid="snap-to-origin-box"
            :while-drag="{ scale: 1.1 }"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          >
            Snap
          </motion.div>
        </div>

        <div class="mt-4 text-sm text-gray-600">
          <p>Drag count: {{ dragCount }}</p>
          <p>Snap back count: {{ snapBackCount }}</p>
        </div>

        <div class="mt-4 text-sm">
          <h3 class="font-semibold mb-2">
            Expected behavior:
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>✅ Drag box anywhere and release</li>
            <li>✅ Box should smoothly animate back to (0,0)</li>
            <li>✅ Click box during snap-back animation</li>
            <li>✅ Animation should continue uninterrupted</li>
            <li>✅ Box should still reach (0,0)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
