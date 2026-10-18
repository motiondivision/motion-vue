<script setup vapor lang="ts">
</script>

<template>
  <div>
    <p class="lead">
      基础 <code>drag: true</code>（无外部约束 / LayoutGroup）。
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
  </div>
</template>
