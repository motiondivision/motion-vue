<script setup lang="ts">
import { ref } from 'vue'
import { RowValue, useScroll } from 'motion-v'

const axis = ref<'x' | 'y'>('y')
const containerRef = ref<HTMLElement>()
const { scrollX, scrollXProgress, scrollY, scrollYProgress } = useScroll(
  () => ({ container: containerRef.value ? containerRef : undefined, axis: axis.value }),
)

function toggleAxis() {
  axis.value = axis.value === 'y' ? 'x' : 'y'
}
</script>

<template>
  <div>
    <button class="toggle-axis" @click="toggleAxis">Toggle axis (current: {{ axis }})</button>
    <div class="current-axis">{{ axis }}</div>
    <div>Scroll Y: <span class="scroll-y-value"><RowValue :value="scrollY" /></span></div>
    <div>Scroll X: <span class="scroll-x-value"><RowValue :value="scrollX" /></span></div>
    <div>Progress Y: <span class="scroll-y-progress-value"><RowValue :value="scrollYProgress" /></span></div>
    <div>Progress X: <span class="scroll-x-progress-value"><RowValue :value="scrollXProgress" /></span></div>
    <div
      ref="containerRef"
      class="scroll-container"
      style="width: 300px; height: 300px; overflow: auto;"
    >
      <div style="width: 900px; height: 900px; background: linear-gradient(135deg, #f00, #00f);" />
    </div>
  </div>
</template>
