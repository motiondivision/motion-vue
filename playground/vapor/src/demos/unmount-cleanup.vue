<script setup vapor lang="ts">
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
  <div>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="visible = !visible"
      >
        {{ visible ? '卸载 (unmount)' : '重新挂载' }}
      </button>
    </div>
    <div class="panel">
      <div
        v-if="visible"
        v-motion="{
          initial: { opacity: 0, scale: 0.6 },
          animate: { opacity: 1, scale: 1 },
          transition: { type: 'spring', stiffness: 300, damping: 18 },
        }"
        class="box"
      >
        Mounted
      </div>
      <p
        v-else
        class="lead"
        style="margin: 0"
      >
        已卸载 — 指令 cleanup 会调用 MotionState.unmount()。
      </p>
    </div>
  </div>
</template>
