<script setup vapor lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const x = ref(0)

function nudge() {
  x.value = x.value === 0 ? 100 : 0
}
</script>

<template>
  <div>
    <p class="lead">
      Vapor 下两条推荐路径：
      <code>v-motion</code>（<code>MotionPlugin</code> 注册函数指令）与
      <code>&lt;Motion&gt;</code>（仍是 vdom 组件，需 <code>vaporInteropPlugin</code>）。
      下方同屏对照；各特性页也有成对演示。
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="nudge"
      >
        移动 X → {{ x }}
      </button>
    </div>

    <p class="path-heading">
      <span class="path-chip directive">v-motion</span>
    </p>
    <div class="panel">
      <div
        v-motion="{
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1, x },
          transition: { type: 'spring', stiffness: 260, damping: 20 },
        }"
        class="box"
      >
        Directive
      </div>
    </div>

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt;</span>
    </p>
    <div class="panel">
      <Motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :animate="{ opacity: 1, scale: 1, x }"
        :transition="{ type: 'spring', stiffness: 260, damping: 20 }"
        class="box"
      >
        Motion
      </Motion>
    </div>
  </div>
</template>
