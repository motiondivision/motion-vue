<script setup vapor lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const parentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

const animate = ref<'hidden' | 'visible'>('visible')

function toggle() {
  animate.value = animate.value === 'visible' ? 'hidden' : 'visible'
}
</script>

<template>
  <div>
    <p class="lead">
      组件路径：父 <code>&lt;Motion&gt;</code> 的 variant 经 provide/inject 传给子节点，并支持
      <code>staggerChildren</code>。指令路径无组件树，无法传播。
    </p>

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt; + variants</span>
    </p>

    <div class="controls">
      <button
        type="button"
        class="btn primary"
        data-testid="toggle-variants"
        @click="toggle"
      >
        {{ animate === 'visible' ? '收起 (hidden)' : '展开 (visible)' }}
      </button>
    </div>

    <div class="panel">
      <Motion
        data-testid="variants-parent"
        initial="hidden"
        :animate="animate"
        :variants="parentVariants"
        style="display: flex; flex-wrap: wrap; gap: 0.75rem; width: 100%"
      >
        <Motion
          v-for="i in 4"
          :key="i"
          class="box"
          :class="i % 2 === 0 ? 'alt' : ''"
          :variants="childVariants"
          :transition="{ type: 'spring', stiffness: 320, damping: 22 }"
          :data-testid="`variants-child-${i}`"
          style="width: 5.5rem; height: 5.5rem"
        >
          {{ i }}
        </Motion>
      </Motion>
    </div>
  </div>
</template>
