<script setup vapor lang="ts">
</script>

<template>
  <div>
    <p class="lead">
      Hover / Press 不依赖 MotionConfig 或父子 context。
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
  </div>
</template>
