<script setup lang="ts">
import { ref } from 'vue'
import { RowValue, ScrollOffset, useScroll } from 'motion-v'

const containerRef = ref<HTMLElement>()
const targetRef = ref<HTMLElement>()

const { scrollYProgress } = useScroll({
  container: containerRef,
  target: targetRef,
  offset: ScrollOffset.Enter as any,
})
</script>

<template>
  <div>
    <div>Progress: <span class="scroll-y-progress-value"><RowValue :value="scrollYProgress" /></span></div>
    <div
      ref="containerRef"
      class="scroll-container"
      style="height: 300px; overflow-y: auto;"
    >
      <div style="height: 200px;">Before target</div>
      <div
        ref="targetRef"
        class="scroll-target"
        style="height: 150px; background: #f0f0f0;"
      >
        Target
      </div>
      <div style="height: 300px;">After target</div>
    </div>
  </div>
</template>
