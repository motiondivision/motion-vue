<script setup lang="ts">
import { ref } from 'vue'
import { useAnimationFrame } from 'motion-v'

const cubeRef = ref<HTMLElement | null>(null)

useAnimationFrame((t) => {
  const rotate = Math.sin(t / 10000) * 200
  const y = (1 + Math.sin(t / 1000)) * -50
  if (cubeRef.value) {
    cubeRef.value!.style.transform = `translateY(${y}px) rotateX(${rotate}deg) rotateY(${rotate}deg)`
  }
})
</script>

<template>
  <div class="flex w-full items-center justify-center">
    <div class="h-40 w-40 [perspective:800px]">
      <div
        ref="cubeRef"
        class="relative h-40 w-40 [transform-style:preserve-3d]"
      >
        <div class="absolute h-full w-full bg-red-500/60 [transform:rotateY(0deg)_translateZ(100px)]" />
        <div class="absolute h-full w-full bg-yellow-500/60 [transform:rotateY(90deg)_translateZ(100px)]" />
        <div class="absolute h-full w-full bg-pink-500/60 [transform:rotateY(180deg)_translateZ(100px)]" />
        <div class="absolute h-full w-full bg-purple-500/60 [transform:rotateY(-90deg)_translateZ(100px)]" />
        <div class="absolute h-full w-full bg-blue-500/60 [transform:rotateX(90deg)_translateZ(100px)]" />
        <div class="absolute h-full w-full bg-emerald-500/60 [transform:rotateX(-90deg)_translateZ(100px)]" />
      </div>
    </div>
  </div>
</template>
