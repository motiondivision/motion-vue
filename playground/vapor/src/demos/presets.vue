<script setup vapor lang="ts">
import { ref } from 'vue'

const show = ref(true)

function remount() {
  show.value = false
  requestAnimationFrame(() => {
    show.value = true
  })
}
</script>

<template>
  <div>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="remount"
      >
        重新挂载预设
      </button>
    </div>
    <div
      v-if="show"
      class="panel"
    >
      <div
        v-fade-in
        class="box"
      >
        fade-in
      </div>
      <div
        v-slide-up
        class="box alt"
      >
        slide-up
      </div>
      <div
        v-scale-in
        class="box warm"
      >
        scale-in
      </div>
    </div>
  </div>
</template>
