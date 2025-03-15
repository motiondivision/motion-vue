<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const isVisible = ref(true)
const x = ref(0)
const scale = ref(1)
const rotate = ref(0)

function toggleVisibility() {
  isVisible.value = !isVisible.value
}

function randomize() {
  x.value = Math.random() * 200 - 100
  scale.value = 0.8 + Math.random() * 0.4
  rotate.value = Math.random() * 180 - 90
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Basic Animations
    </h1>

    <div class="flex flex-col items-center gap-8">
      <div class="flex gap-4">
        <button
          class="btn btn-primary"
          @click="toggleVisibility"
        >
          {{ isVisible ? 'Hide' : 'Show' }}
        </button>
        <button
          class="btn btn-outline"
          @click="randomize"
        >
          Randomize
        </button>
      </div>

      <div class="relative w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Motion
          v-if="isVisible"
          :animate="{
            x,
            scale,
            rotate,
          }"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-32 h-32 bg-primary-500 rounded-lg shadow-lg"
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

.trigger {
  margin: 2rem 0;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #646cff;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.trigger:hover {
  background: #646cff;
  color: white;
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
  width: 100px;
  height: 100px;
  background: #646cff;
  margin: 1rem auto;
  border-radius: 8px;
}
</style>
