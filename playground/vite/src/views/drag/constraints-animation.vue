<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef1 = ref<HTMLDivElement>()
const containerRef2 = ref<HTMLDivElement>()
const containerRef3 = ref<HTMLDivElement>()
const containerRef4 = ref<HTMLDivElement>()

const dragStartCount = ref(0)
const dragEndCount = ref(0)

function onDragStart() {
  dragStartCount.value++
}

function onDragEnd() {
  dragEndCount.value++
}
</script>

<template>
  <div class="p-8">
    <div class="space-y-8">
      <!-- Test 2: dragSnapToOrigin behavior -->
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">
          Test 2: dragSnapToOrigin
        </h2>
        <div
          ref="containerRef2"
          class="relative bg-gray-100 rounded"
          style="width: 400px; height: 300px;"
        >
          <motion.div
            :drag="true"
            :drag-snap-to-origin="true"
            :initial="{ x: 0, y: 0 }"
            class="absolute w-20 h-20 bg-green-500 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold"
            style="top: 0; left: 0;"
            data-testid="drag-box-2"
            :while-drag="{ scale: 1.1 }"
          >
            Snap
          </motion.div>
        </div>
      </div>

      <!-- Test 1: Click during constraint return -->
      <div class="border p-4 rounded">
        <div
          ref="containerRef1"
          class="relative bg-gray-100 rounded"
          style="width: 400px; height: 300px;"
        >
          <motion.div
            :drag="true"
            :drag-constraints="containerRef1"
            :drag-elastic="0.2"
            class="w-20 h-20 bg-blue-500 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold"
            data-testid="drag-box-1"
            :while-drag="{ scale: 1.1 }"
          >
            Drag Me
          </motion.div>
        </div>
      </div>
    </div>
  </div>
</template>
