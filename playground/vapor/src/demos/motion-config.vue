<script setup vapor lang="ts">
import { Motion, MotionConfig } from 'motion-v'
import { ref } from 'vue'
import ConfigProbe from './config-probe.vue'

const mode = ref<'never' | 'always'>('never')
const nudge = ref(0)
/** Remount key so MotionState picks up a fresh motionConfig after mode changes. */
const configEpoch = ref(0)

function toggleMode() {
  mode.value = mode.value === 'never' ? 'always' : 'never'
  configEpoch.value += 1
  nudge.value = 0
}

function bump() {
  nudge.value = nudge.value === 0 ? 120 : 0
}
</script>

<template>
  <div>
    <p class="lead">
      组件路径：<code>MotionConfig</code> 通过 provide/inject 向下继承
      <code>reducedMotion</code> / 默认 <code>transition</code>。
      指令路径读不到该 context。
    </p>

    <p class="path-heading">
      <span class="path-chip component">MotionConfig inheritance</span>
    </p>

    <div class="controls">
      <button
        type="button"
        class="btn primary"
        data-testid="toggle-reduced"
        @click="toggleMode"
      >
        reducedMotion: {{ mode }}
      </button>
      <button
        type="button"
        class="btn"
        data-testid="bump-config"
        @click="bump"
      >
        触发动画 → x={{ nudge }}
      </button>
    </div>

    <MotionConfig
      :key="`cfg-${configEpoch}`"
      :reduced-motion="mode"
      :transition="{ type: 'spring', stiffness: 180, damping: 18 }"
    >
      <div
        class="panel"
        style="flex-direction: column; align-items: flex-start"
      >
        <ConfigProbe />
        <Motion
          :key="`box-${configEpoch}`"
          data-testid="config-box"
          class="box"
          :initial="{ opacity: 0.4, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1, x: nudge }"
        >
          {{ mode === 'always' ? '跳过动画' : '跟随 spring' }}
        </Motion>
        <p style="margin: 0; color: rgba(255,255,255,0.55); font-size: 0.85rem; max-width: 22rem">
          <code>always</code> 时应瞬间到位；
          <code>never</code> 时继承 Config 的 spring。
          下方 probe 确认 inject 是否到达子树。
        </p>
      </div>
    </MotionConfig>
  </div>
</template>
