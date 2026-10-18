<script setup vapor lang="ts">
import { Motion } from 'motion-v'
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
    <p class="lead">
      插件 <code>presets</code> 只注册指令（如 <code>v-fade-in</code>）。
      <code>&lt;Motion&gt;</code> 没有预设 prop，下方用等价 props 对照。
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="remount"
      >
        重新挂载
      </button>
    </div>

    <template v-if="show">
      <p class="path-heading">
        <span class="path-chip directive">v-motion presets</span>
        MotionPlugin 注册的函数指令
      </p>
      <div class="panel">
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

      <p class="path-heading">
        <span class="path-chip component">&lt;Motion&gt;</span>
        等价 initial / animate / transition（非预设）
      </p>
      <div class="panel">
        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.5 }"
          class="box"
        >
          fade-in
        </Motion>
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
          class="box alt"
        >
          slide-up
        </Motion>
        <Motion
          :initial="{ opacity: 0, scale: 0.5 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
          class="box warm"
        >
          scale-in
        </Motion>
      </div>
    </template>
  </div>
</template>
