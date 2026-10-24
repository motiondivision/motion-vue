<script setup vapor lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const visibleDir = ref(true)
const visibleComp = ref(true)
</script>

<template>
  <div>
    <p class="path-heading">
      <span class="path-chip directive">v-motion</span>
      指令 cleanup → MotionState.unmount()
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="visibleDir = !visibleDir"
      >
        {{ visibleDir ? '卸载指令节点' : '重新挂载指令' }}
      </button>
    </div>
    <div class="panel">
      <div
        v-if="visibleDir"
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

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt;</span>
      组件卸载同样清理 MotionState
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="visibleComp = !visibleComp"
      >
        {{ visibleComp ? '卸载 Motion' : '重新挂载 Motion' }}
      </button>
    </div>
    <div class="panel">
      <Motion
        v-if="visibleComp"
        :initial="{ opacity: 0, scale: 0.6 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 18 }"
        class="box"
      >
        Mounted
      </Motion>
      <p
        v-else
        class="lead"
        style="margin: 0"
      >
        已卸载 — &lt;Motion&gt; 卸载会清理 MotionState。
      </p>
    </div>
  </div>
</template>
