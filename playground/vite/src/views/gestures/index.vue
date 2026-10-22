<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const scale = ref(1)
const rotate = ref(0)
const borderRadius = ref(8)

function onHoverStart() {
  scale.value = 1.2
  rotate.value = 5
  borderRadius.value = 16
}

function onHoverEnd() {
  scale.value = 1
  rotate.value = 0
  borderRadius.value = 8
}

function onTap() {
  scale.value = 0.8
  setTimeout(() => {
    scale.value = 1
  }, 100)
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Gestures
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Hover and tap
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        Hover the tile to scale and round it, tap to press it down.
      </p>
    </header>

    <div class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(123,47,247,0.10),transparent_70%)]" />
      <div class="relative h-[300px]">
        <Motion
          :animate="{
            scale,
            rotate,
            borderRadius,
          }"
          :transition="{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }"
          class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2
                 cursor-pointer bg-gradient-to-br from-violet-400/40 to-violet-500/20
                 ring-1 ring-inset ring-violet-200/30"
          @hover-start="onHoverStart"
          @hover-end="onHoverEnd"
          @tap="onTap"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.demo-item {
  text-align: center;
}

.demo-box {
  width: 150px;
  height: 150px;
  background: #646cff;
  margin: 1rem auto;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.demo-box p {
  margin: 0.25rem 0;
}
</style>
