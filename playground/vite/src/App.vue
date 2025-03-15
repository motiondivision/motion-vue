<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const isVisible = ref(true)
const x = ref(0)

function toggleVisibility() {
  isVisible.value = !isVisible.value
}

function moveBox() {
  x.value = x.value === 0 ? 200 : 0
}
</script>

<template>
  <router-view v-slot="{ Component }">
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -20 }"
      :transition="{ duration: 0.2 }"
      mode="wait"
    >
      <component :is="Component" />
    </Motion>
  </router-view>
</template>

<style>
body {
  margin: 0;
  min-height: 100vh;
  color: #2c3e50;
  background: #f8f9fa;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  color: #1a1a1a;
}
</style>
