<script setup lang="ts">
import { ref } from 'vue'
import { Motion, motionValue } from 'motion-v'

const show = ref(true)
const y = motionValue(0)
setTimeout(() => {
  y.set(100)
}, 2000)
</script>

<template>
  <div class="flex flex-col items-center">
    <Motion
      v-show="show"
      class="w-20 h-20 bg-purple-500 rounded-md"
      :style="{
        x: 100,
        y: 100,
      }"
    >
      content
    </Motion>
  </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
