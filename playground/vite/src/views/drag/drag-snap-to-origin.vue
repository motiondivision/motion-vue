<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef = ref<HTMLDivElement>()

const dragCount = ref(0)
const snapBackCount = ref(0)

function onDragStart() {
  dragCount.value++
}

function onDragEnd() {
  snapBackCount.value++
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Drag
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Snap back to origin
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        Release the tile anywhere and it animates back to (0,0). Clicking
        mid-flight must not interrupt it.
      </p>
    </header>

    <div class="mb-4 flex flex-wrap gap-2">
      <span class="tile rounded-full px-3 py-1 font-mono text-[11px] text-white/50">
        drags: {{ dragCount }}
      </span>
      <span class="tile rounded-full px-3 py-1 font-mono text-[11px] text-white/50">
        releases: {{ snapBackCount }}
      </span>
    </div>

    <div
      ref="containerRef"
      class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]"
      style="width: 400px; height: 300px;"
    >
      <div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(123,47,247,0.10),transparent_70%)]" />
      <motion.div
        :drag="true"
        :drag-snap-to-origin="true"
        :initial="{ x: 0, y: 0 }"
        class="absolute flex h-20 w-20 cursor-grab select-none items-center justify-center rounded-lg
               bg-gradient-to-br from-violet-400/40 to-violet-500/20 text-xs text-violet-100
               ring-1 ring-inset ring-violet-200/30 active:cursor-grabbing"
        style="top: 0; left: 0;"
        data-testid="snap-to-origin-box"
        :while-drag="{ scale: 1.1 }"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
      >
        Snap
      </motion.div>
    </div>

    <ul class="mt-4 list-disc space-y-1 pl-5 text-sm text-white/40">
      <li>Drag the tile anywhere and release</li>
      <li>It animates back to its origin</li>
      <li>Click during the return; it keeps going</li>
    </ul>
  </div>
</template>
