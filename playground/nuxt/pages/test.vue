<script setup>
import { Motion, useMotionValue, useSpring } from 'motion-v'

const scale = useSpring(useMotionValue(1))
</script>

<template>
  <div>
    <Motion
      class="box"
      :style="{ scale }"
    >
      Motion component
    </Motion>
    <button @click="scale.set(Math.random(0.5, 1))">
      Animate
    </button>
  </div>
</template>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background: red;
  margin: 1rem auto;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
