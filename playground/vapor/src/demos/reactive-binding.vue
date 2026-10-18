<script setup vapor lang="ts">
import { ref } from 'vue'

const x = ref(0)
const opacity = ref(1)

function nudge() {
  x.value = x.value === 0 ? 120 : 0
}

function pulse() {
  opacity.value = opacity.value === 1 ? 0.35 : 1
}
</script>

<template>
  <div>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="nudge"
      >
        切换 X → {{ x }}
      </button>
      <button
        type="button"
        class="btn"
        @click="pulse"
      >
        切换透明度
      </button>
    </div>
    <div class="panel">
      <div
        v-motion="{
          animate: { x, opacity },
          transition: { type: 'spring', stiffness: 280, damping: 22 },
        }"
        class="box"
      >
        Reactive
      </div>
    </div>
  </div>
</template>
