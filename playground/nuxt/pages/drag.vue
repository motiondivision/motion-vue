<script setup lang="ts">
import { Motion } from 'motion-v'

const constraintsRef = ref<HTMLDivElement>()
const dragEnd = ref(false)
function handleDragEnd() {
  dragEnd.value = !dragEnd.value
}
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div
      ref="constraintsRef"
      class="w-[300px] h-[300px] bg-blue-300 rounded"
    >
      <Motion
        :initial="{ x: 0, y: 0 }"
        :animate="{ x: 100, y: 100 }"
        :transition="{ duration: 5 }"
        drag
        :drag-constraints="constraintsRef"
        class="w-[100px] h-[100px] bg-blue-500 rounded"
        :data-end="dragEnd"
        @drag-end="handleDragEnd"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
