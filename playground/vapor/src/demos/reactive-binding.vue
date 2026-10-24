<script setup vapor lang="ts">
import { Motion } from 'motion-v'
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

    <p class="path-heading">
      <span class="path-chip directive">v-motion</span>
      绑定对象中的响应式目标
    </p>
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

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt;</span>
      :animate 绑定同一组 ref
    </p>
    <div class="panel">
      <Motion
        :animate="{ x, opacity }"
        :transition="{ type: 'spring', stiffness: 280, damping: 22 }"
        class="box"
      >
        Reactive
      </Motion>
    </div>
  </div>
</template>
