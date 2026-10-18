<script setup vapor lang="ts">
</script>

<template>
  <div>
    <p class="lead">
      绑定值语法：<code>v-motion="{ initial, animate, transition }"</code>
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
  </div>
</template>
