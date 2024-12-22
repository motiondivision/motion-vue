<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

const constraintsRef = ref<HTMLDivElement>()
const dragEnd = ref(false)
function handleDragEnd() {
  dragEnd.value = !dragEnd.value
}

const show = ref(true)
function handleClick() {
  show.value = !show.value
}
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div
      ref="constraintsRef"
      class="w-[300px] h-[300px] bg-blue-300 rounded"
    >
      <AnimatePresence>
        <Motion
          v-show="show"
          :initial="{ x: 0, y: 0 }"
          :animate="{ x: 100, y: 100 }"
          :exit="{ x: 0, y: 0 }"
          :transition="{ duration: 10 }"
          drag
          :drag-constraints="constraintsRef"
          class="w-[100px] h-[100px] bg-blue-500 rounded"
          :data-end="dragEnd"
          @click="handleClick"
          @drag-end="handleDragEnd"
        />
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>

</style>
