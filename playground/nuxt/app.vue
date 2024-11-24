<script setup lang="ts">
import { Motion, useMotionValue } from 'motion-v'

const draw = {
  hidden: { pathLength: 0,
    //  opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, bounce: 0 },
      // opacity: { duration: 1 },
    },
  },
}
const opacity = useMotionValue(0)
</script>

<template>
  <div>
    <Motion
      as="svg"
      width="600"
      height="600"
      viewBox="0 0 600 600"
      data-a="123"
    >
      <Motion
        as="circle"
        cx="300"
        cy="300"
        r="80"
        stroke="#ff0055"
        :initial="{
          opacity: 0,
        }"
        :animate="{
          opacity: 1,
        }"
      />
    </Motion>
  </div>
</template>

<style scoped>
circle {
  stroke-width: 10px;
  stroke-linecap: round;
  fill: transparent;
}
</style>
