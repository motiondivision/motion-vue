<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-vue'

const show = ref(true)
</script>

<template>
  <div class="flex flex-col items-center">
    <button
      class="mb-4"
      @click="show = !show"
    >
      toggle
    </button>
    <AnimatePresence>
      <Motion
        v-show="show"
        class="w-20 h-20 bg-purple-500 rounded-md"
        :initial="{ scale: 0 }"
        :animate="{ scale: 1 }"
        :exit="{ scale: 0,
                 transition: {
                   duration: 5,
                 },
        }"
        :transition="{ duration: 5 }"
      >
        content
      </Motion>
    </AnimatePresence>
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
