<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef = ref<HTMLDivElement>()

function onDragStart() {
  console.log('Drag started')
}

function onDragEnd() {
  console.log('Drag ended')
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Drag
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Scroll while dragging
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        Scroll the container or the window mid-drag. The tile must stay under
        the cursor.
      </p>
    </header>

    <section class="mb-8">
      <h2 class="mb-3 text-sm font-medium text-white/70">
        Container scroll
      </h2>
      <div
        ref="containerRef"
        class="relative overflow-scroll rounded-2xl border border-white/[0.08] bg-[#0d0d0f]"
        style="width: 400px; height: 300px;"
      >
        <motion.div
          :drag="true"
          :drag-elastic="0"
          :drag-momentum="false"
          class="absolute flex h-20 w-20 cursor-grab select-none items-center justify-center rounded-lg
                 bg-gradient-to-br from-violet-400/40 to-violet-500/20 text-xs text-violet-100
                 ring-1 ring-inset ring-violet-200/30 active:cursor-grabbing"
          style="top: 100px; left: 100px;"
          data-testid="draggable-in-scrollable"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
        >
          Drag
        </motion.div>

        <div
          class="absolute rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white/40"
          style="top: 800px; left: 100px; width: 200px; height: 100px;"
        >
          Scroll target
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-sm font-medium text-white/70">
        Window scroll
      </h2>
      <motion.div
        :drag="true"
        :initial="{ x: 0, y: 0 }"
        class="flex h-20 w-20 cursor-grab select-none items-center justify-center rounded-lg
               bg-white/[0.08] text-xs text-white/70 ring-1 ring-inset ring-white/15
               active:cursor-grabbing"
        data-testid="draggable-window-scroll"
      >
        Drag
      </motion.div>

      <div style="height: 1000px;" />
    </section>
  </div>
</template>
