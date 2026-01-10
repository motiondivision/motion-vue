<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef = ref<HTMLDivElement>()

function onDragStart() {
  console.log('Drag started')
}

function onDragEnd() {
  console.log('Drag ended')
}
</script>

<template>
  <div class="p-8">
    <div class="space-y-8">
      <div class="border p-4 rounded">
        <h1 class="text-2xl font-bold mb-4">
          Scroll While Drag Test
        </h1>
        <p class="text-sm text-gray-600 mb-4">
          Drag the box and try scrolling. The box should stay attached to the cursor.
        </p>
      </div>

      <!-- Test: Scrollable container with draggable element -->
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">
          Element Scroll
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          Drag the red box and scroll the container using mouse wheel or trackpad.
          The box should stay attached to your cursor.
        </p>

        <div
          ref="containerRef"
          class="relative bg-gray-100 rounded overflow-scroll"
          style="width: 400px; height: 300px;"
        >
          <motion.div
            :drag="true"
            :drag-elastic="0"
            :drag-momentum="false"
            class="absolute w-20 h-20 bg-red-500 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold select-none"
            style="top: 100px; left: 100px;"
            data-testid="draggable-in-scrollable"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          >
            Drag
          </motion.div>

          <!-- Content to make container scrollable -->
          <div
            class="absolute"
            style="top: 800px; left: 100px; width: 200px; height: 100px; background: #ccc;"
          >
            Scroll target
          </div>
        </div>
      </div>

      <!-- Test: Window scroll -->
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">
          Window Scroll
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          Drag the blue box and scroll the window. The box should stay attached to your cursor.
        </p>

        <motion.div
          :drag="true"
          :initial="{ x: 0, y: 0 }"
          class="w-20 h-20 bg-blue-500 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold select-none"
          data-testid="draggable-window-scroll"
        >
          Drag
        </motion.div>

        <!-- Spacer to enable window scroll -->
        <div style="height: 1000px;" />
      </div>
    </div>
  </div>
</template>
