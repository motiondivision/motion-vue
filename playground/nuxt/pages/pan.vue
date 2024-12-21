<script setup lang="ts">
import { Motion, useMotionValue, useTransform } from 'motion-v'
import type { PanInfo, TransformProperties } from 'motion-v'

function template({ rotateY, rotateX }: TransformProperties) {
  return `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
}

const transform = useMotionValue({
  rotateY: 0,
  rotateX: 0,
})
const transformTemplate = useTransform(transform, (value) => {
  return `perspective(500px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg)`
})

function handlePan(_: PointerEvent, info: PanInfo) {
  transform.set({
    rotateY: info.offset.x / 2,
    rotateX: -info.offset.y / 2,
  })
}

function handlePanEnd() {
  transform.set({
    rotateY: 0,
    rotateX: 0,
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <Motion
      class="card"
      :style="{ transform: transformTemplate }"
      @pan="handlePan"
      @pan-end="handlePanEnd"
    />
  </div>
</template>

<style scoped>
.card {
  width: 400px;
  height: 250px;
  border-radius: 10px;
  cursor: pointer;
  background-image: url(/pug.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;

  &:active {
    cursor: grab;
  }
}
</style>
