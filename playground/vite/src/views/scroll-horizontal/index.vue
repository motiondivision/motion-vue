<script setup lang="ts">
import { ref } from 'vue'
import { RowValue, useScroll } from 'motion-v'

const containerRef = ref<HTMLElement>()
const { scrollX, scrollXProgress } = useScroll({ container: containerRef, axis: 'x' })
</script>

<template>
  <div>
    <div>Scroll X: <span class="scroll-x-value"><RowValue :value="scrollX" /></span></div>
    <div>Progress: <span class="scroll-x-progress-value"><RowValue :value="scrollXProgress" /></span></div>
    <div
      ref="containerRef"
      class="scroll-container-h"
      style="width: 300px; height: 100px; overflow-x: auto; white-space: nowrap;"
    >
      <div style="width: 900px; height: 80px; background: linear-gradient(to right, #f00, #00f);" />
    </div>
  </div>
</template>
