<script setup vapor lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div>
    <p class="lead">
      基础 <code>drag</code>（无外部约束 / LayoutGroup）。
    </p>

    <p class="path-heading">
      <span class="path-chip directive">v-motion</span>
    </p>
    <div
      class="panel"
      style="min-height: 14rem"
    >
      <div
        v-motion="{
          drag: true,
          whileDrag: { scale: 1.08 },
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }"
        class="box warm"
        style="cursor: grab"
      >
        Drag me
      </div>
    </div>

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt;</span>
    </p>
    <div
      class="panel"
      style="min-height: 14rem"
    >
      <Motion
        :drag="true"
        :while-drag="{ scale: 1.08 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
        class="box warm"
        style="cursor: grab"
      >
        Drag me
      </Motion>
    </div>
  </div>
</template>
