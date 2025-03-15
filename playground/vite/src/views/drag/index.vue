<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const dragConstraints = ref<HTMLElement | null>(null)
const scale = ref(1)

function onDragStart() {
  scale.value = 1.1
}

function onDragEnd() {
  scale.value = 1
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Drag Animations
    </h1>

    <div class="flex flex-col items-center gap-8">
      <p class="text-lg text-center text-gray-600 dark:text-gray-400">
        Drag the box within the container
      </p>

      <div
        ref="dragConstraints"
        class="relative w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg
               border-2 border-dashed border-gray-300 dark:border-gray-700"
      >
        <Motion
          drag
          :drag-constraints="dragConstraints"
          :animate="{ scale }"
          :transition="{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-32 h-32 bg-primary-500 rounded-lg shadow-lg
                 cursor-move"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.demo-item {
  text-align: center;
}

.constraint-box {
  width: 300px;
  height: 300px;
  border: 2px dashed #646cff;
  border-radius: 8px;
  margin: 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-box {
  width: 100px;
  height: 100px;
  background: #646cff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  cursor: grab;
  user-select: none;
}

.drag-box:active {
  cursor: grabbing;
}
</style>
