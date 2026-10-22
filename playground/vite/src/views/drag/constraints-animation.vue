<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const containerRef1 = ref<HTMLDivElement>()
const containerRef2 = ref<HTMLDivElement>()

const dragStartCount = ref(0)
const dragEndCount = ref(0)

function onDragStart() {
  dragStartCount.value++
}

function onDragEnd() {
  dragEndCount.value++
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Drag
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Constraint return
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        Drag a tile and release. Clicking while it returns to bounds must not
        interrupt the animation.
      </p>
    </header>

    <div class="space-y-8">
      <section>
        <h2 class="mb-3 text-sm font-medium text-white/70">
          dragSnapToOrigin
        </h2>
        <div
          ref="containerRef2"
          class="relative rounded-2xl border border-white/[0.08] bg-[#0d0d0f]"
          style="width: 400px; height: 300px;"
        >
          <div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(123,47,247,0.10),transparent_70%)]" />
          <motion.div
            :drag="true"
            :drag-snap-to-origin="true"
            :initial="{ x: 0, y: 0 }"
            class="absolute flex h-20 w-20 cursor-grab items-center justify-center rounded-lg
                   bg-gradient-to-br from-violet-400/40 to-violet-500/20 text-xs text-violet-100
                   ring-1 ring-inset ring-violet-200/30 active:cursor-grabbing"
            style="top: 0; left: 0;"
            data-testid="drag-box-2"
            :while-drag="{ scale: 1.1 }"
          >
            Snap
          </motion.div>
        </div>
      </section>

      <section>
        <h2 class="mb-3 text-sm font-medium text-white/70">
          Bounded drag
        </h2>
        <p class="mb-3 text-sm leading-relaxed text-white/45">
          Elastic 0.2. The tile springs back inside the container after release.
        </p>
        <div
          ref="containerRef1"
          class="relative rounded-2xl bg-[#0d0d0f] ring-1 ring-inset ring-white/15"
          style="width: 400px; height: 300px;"
        >
          <motion.div
            :drag="true"
            :drag-constraints="containerRef1"
            :drag-elastic="0.2"
            class="flex h-20 w-20 cursor-grab items-center justify-center rounded-lg
                   bg-white/[0.08] text-xs text-white/70
                   active:cursor-grabbing"
            data-testid="drag-box-1"
            :while-drag="{ scale: 1.1 }"
          >
            Drag me
          </motion.div>
        </div>
      </section>
    </div>
  </div>
</template>
