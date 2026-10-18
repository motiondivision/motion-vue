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
      <code>&lt;Motion&gt;</code> 仍是 vdom <code>defineComponent</code>；
      本 app 已 <code>use(vaporInteropPlugin)</code>，因此可在 vapor 根下使用。
    </p>
    <div class="controls">
      <button
        type="button"
        class="btn primary"
        @click="nudge"
      >
        移动 X
      </button>
    </div>
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
