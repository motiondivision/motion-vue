<script setup vapor lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div>
    <p class="lead">
      Hover / Press 不依赖 MotionConfig 或父子 context。
    </p>

    <p class="path-heading">
      <span class="path-chip directive">v-motion</span>
    </p>
    <div class="panel">
      <div
        v-motion="{
          whileHover: { scale: 1.12, rotate: 4 },
          whilePress: { scale: 0.94 },
          transition: { type: 'spring', stiffness: 400, damping: 17 },
        }"
        class="box"
        style="cursor: pointer"
      >
        Hover me
      </div>
      <div
        v-motion="{
          whileHover: { backgroundColor: '#22c55e' },
          whilePress: { scale: 0.9 },
          transition: { duration: 0.2 },
        }"
        class="box alt"
        style="cursor: pointer"
      >
        Press
      </div>
    </div>

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt;</span>
    </p>
    <div class="panel">
      <Motion
        :while-hover="{ scale: 1.12, rotate: 4 }"
        :while-press="{ scale: 0.94 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 17 }"
        class="box"
        style="cursor: pointer"
      >
        Hover me
      </Motion>
      <Motion
        :while-hover="{ backgroundColor: '#22c55e' }"
        :while-press="{ scale: 0.9 }"
        :transition="{ duration: 0.2 }"
        class="box alt"
        style="cursor: pointer"
      >
        Press
      </Motion>
    </div>
  </div>
</template>
