<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const scale = ref(1)
const rotate = ref(0)
const borderRadius = ref(8)

function onHoverStart() {
  scale.value = 1.2
  rotate.value = 5
  borderRadius.value = 16
}

function onHoverEnd() {
  scale.value = 1
  rotate.value = 0
  borderRadius.value = 8
}

function onTap() {
  scale.value = 0.8
  setTimeout(() => {
    scale.value = 1
  }, 100)
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Gesture Animations
    </h1>

    <div class="flex flex-col items-center gap-8">
      <p class="text-lg text-center text-gray-600 dark:text-gray-400">
        Hover and tap the box below to see gesture animations
      </p>

      <div class="relative w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Motion
          :animate="{
            scale,
            rotate,
            borderRadius,
          }"
          :transition="{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-32 h-32 bg-primary-500 rounded-lg shadow-lg
                 cursor-pointer"
          @hover-start="onHoverStart"
          @hover-end="onHoverEnd"
          @tap="onTap"
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

.demo-box {
  width: 150px;
  height: 150px;
  background: #646cff;
  margin: 1rem auto;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.demo-box p {
  margin: 0.25rem 0;
}
</style>
