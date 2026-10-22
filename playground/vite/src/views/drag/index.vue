<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const dragConstraints = ref<HTMLElement | null>(null)
const scale = ref(1)

function onDragStart() {
  scale.value = 1.1
}

function onDragEnd() {
  scale.value = 1
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Drag
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Drag within bounds
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        The tile scales while you drag and stays inside the dashed area.
      </p>
    </header>

    <div class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(123,47,247,0.10),transparent_70%)]" />
      <div
        ref="dragConstraints"
        class="relative m-4 h-[380px] rounded-xl border border-dashed border-white/15"
      >
        <Motion
          drag
          :drag-constraints="dragConstraints"
          :animate="{ scale }"
          :transition="{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }"
          class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2
                 cursor-move bg-gradient-to-br from-violet-400/40 to-violet-500/20
                 ring-1 ring-inset ring-violet-200/30"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
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

.constraint-box {
  width: 300px;
  height: 300px;
  border: 2px dashed #646cff;
  border-radius: 8px;
  margin: 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-box {
  width: 100px;
  height: 100px;
  background: #646cff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  cursor: grab;
  user-select: none;
}

.drag-box:active {
  cursor: grabbing;
}
</style>
