<script setup vapor lang="ts">
import { AnimatePresence, Motion } from 'motion-v'
import { ref } from 'vue'

/**
 * Tried under createVaporApp + vaporInteropPlugin:
 * AnimatePresence's slot watcher does not keep exiting children alive when
 * v-if is driven by a vapor parent — the node is removed immediately
 * (~1 frame), so :exit never plays. Same pattern works in playground/vite (vdom).
 */
const show = ref(true)
const lastRemovedAt = ref<string | null>(null)

function toggle() {
  if (show.value) {
    lastRemovedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  }
  show.value = !show.value
}
</script>

<template>
  <div>
    <div
      class="stub"
      style="margin-bottom: 1.25rem"
    >
      <h2>Tried · broken under vapor + interop</h2>
      <p>
        <code>AnimatePresence</code> + <code>&lt;Motion&gt; :exit</code> 在
        vapor 父级 <code>v-if</code> 驱动下会<strong>立即卸除</strong> DOM，
        exit 动画来不及播放。vdom playground（<code>playground/vite</code>）正常。
      </p>
      <p>
        <code>usePresence</code> / <code>safeToRemove</code> 同样依赖 presence
        挂起，当前路径下也无法验证。
      </p>
    </div>

    <p class="path-heading">
      <span class="path-chip component">AnimatePresence attempt (expect instant remove)</span>
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        data-testid="toggle-presence"
        @click="toggle"
      >
        {{ show ? '隐藏（观察是否有 exit）' : '重新显示' }}
      </button>
    </div>
    <p
      v-if="lastRemovedAt"
      class="lead"
      style="margin-bottom: 0.75rem"
    >
      上次隐藏：{{ lastRemovedAt }}（若无滑动/淡出，即为 broken）
    </p>
    <div
      class="panel"
      style="min-height: 9rem"
    >
      <AnimatePresence>
        <Motion
          v-if="show"
          key="exit-box"
          data-testid="presence-box"
          class="box"
          :initial="{ opacity: 0, x: -40 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: 50 }"
          :transition="{ duration: 0.45 }"
        >
          Exit me
        </Motion>
      </AnimatePresence>
    </div>
  </div>
</template>
