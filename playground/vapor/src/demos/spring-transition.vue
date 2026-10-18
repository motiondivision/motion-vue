<script setup vapor lang="ts">
import { ref } from 'vue'

const target = ref(0)

function flip() {
  target.value = target.value === 0 ? 1 : 0
}
</script>

<template>
  <div>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="flip"
      >
        Toggle spring target
      </button>
    </div>
    <div class="panel">
      <div
        v-motion="{
          animate: {
            x: target === 0 ? 0 : 140,
            rotate: target === 0 ? 0 : 180,
            borderRadius: target === 0 ? '1rem' : '50%',
          },
          transition: { type: 'spring', stiffness: 180, damping: 14 },
        }"
        class="box"
      >
        Spring
      </div>
      <div
        v-motion="{
          animate: {
            x: target === 0 ? 0 : 140,
            scale: target === 0 ? 1 : 1.25,
          },
          transition: { duration: 0.45, ease: 'easeInOut' },
        }"
        class="box alt"
      >
        Tween
      </div>
    </div>
  </div>
</template>
