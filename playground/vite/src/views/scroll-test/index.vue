<script setup lang="ts">
import { ref } from 'vue'
import { Motion, RowValue, useScroll } from 'motion-v'

const containerRef = ref<HTMLElement>()
const targetRef = ref<HTMLElement | null>(null)

const { scrollY, scrollYProgress } = useScroll({
  container: containerRef as any,
  target: targetRef as any,
})
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <div>Scroll Y: <span class="scroll-y-value"><RowValue :value="scrollY" /></span></div>
      <div>Progress: <span class="scroll-progress-value"><RowValue :value="scrollYProgress" /></span></div>
    </div>

    <Motion
      ref="containerRef"
      class="scroll-container"
      style="height: 300px; overflow: auto; border: 1px solid #ccc;"
    >
      <div style="height: 100px;">
        Above Target
      </div>

      <Motion
        ref="targetRef"
        class="scroll-target"
        style="height: 150px; background-color: #f0f0f0;"
      >
        Target Content
      </Motion>

      <div style="height: 200px;">
        Below Target
      </div>
    </Motion>
  </div>
</template>
