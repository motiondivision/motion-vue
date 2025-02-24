<script setup lang="ts">
import { Motion, delay } from 'motion-v'

const spring = { damping: 3, stiffness: 50, restDelta: 0.001 }
const scaleValue = useMotionValue(0)
const scale = useSpring(scaleValue, spring)

delay(() => {
  scale.set(1)
}, 0.5)
</script>

<template>
  <Motion
    as="div"
    :style="{
      scale,
    }"
    class="size-20 bg-primary rounded-full"
  />
</template>
