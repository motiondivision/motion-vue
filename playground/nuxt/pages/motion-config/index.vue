<script setup lang="ts">
import { Motion, MotionConfig } from 'motion-v'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <MotionConfig reduce-motion="always">
      <Motion
        :initial="{ opacity: 0, y: 100 }"
        :animate="{ opacity: 1, y: 0 }"
        class="w-[200px] h-[200px] bg-purple-500 rounded-lg"
      >
        <div>Hello</div>
      </Motion>
    </MotionConfig>
  </div>
</template>
