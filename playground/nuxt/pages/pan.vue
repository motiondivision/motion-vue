<script setup lang="ts">
import { Motion, useAnimationControls } from 'motion-v'
import type { PanInfo, TransformProperties } from 'motion-v'

function template({ rotateY, rotateX }: TransformProperties) {
  return `perspective(500px) rotateX(${rotateX}) rotateY(${rotateY})`
}

const controls = useAnimationControls()
function handlePan(e: PointerEvent, info: PanInfo) {
  e.preventDefault()
  controls.set({
    rotateY: info.offset.x / 2,
    rotateX: -info.offset.y / 2,
  })
}

function handlePanEnd() {
  controls.start({
    rotateY: 0,
    rotateX: 0,
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center ">
    <Motion
      class="card touch-none"
      :transform-template="template"
      :animate="controls"
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
