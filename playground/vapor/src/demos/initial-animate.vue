<script setup vapor lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div>
    <p class="lead">
      同一进入动画，分别用 <code>v-motion</code> 与 <code>&lt;Motion&gt;</code> 实现。
    </p>

    <p class="path-heading">
      <span class="path-chip directive">v-motion</span>
      绑定值语法
    </p>
    <div class="panel">
      <div
        v-motion="{
          initial: { opacity: 0, y: 40, scale: 0.85 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { type: 'spring', stiffness: 220, damping: 20 },
        }"
        class="box"
      >
        Fade In
      </div>
      <div
        v-motion="{
          initial: { opacity: 0, x: -48 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.55 },
        }"
        class="box alt"
      >
        Slide In
      </div>
    </div>

    <p class="path-heading">
      <span class="path-chip component">&lt;Motion&gt;</span>
      props：initial / animate / transition
    </p>
    <div class="panel">
      <Motion
        :initial="{ opacity: 0, y: 40, scale: 0.85 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :transition="{ type: 'spring', stiffness: 220, damping: 20 }"
        class="box"
      >
        Fade In
      </Motion>
      <Motion
        :initial="{ opacity: 0, x: -48 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.55 }"
        class="box alt"
      >
        Slide In
      </Motion>
    </div>
  </div>
</template>
