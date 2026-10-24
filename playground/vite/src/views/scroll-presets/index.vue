<script setup lang="ts">
import { ref } from 'vue'
import { RowValue, ScrollOffset, useScroll } from 'motion-v'

const containerRef = ref<HTMLElement>()
const targetRef = ref<HTMLElement>()

const { scrollYProgress } = useScroll({
  container: containerRef,
  target: targetRef,
  offset: ScrollOffset.Enter as any,
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Scroll
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Offset presets
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        ScrollOffset.Enter tracks progress from the moment the target enters the container.
      </p>
    </header>

    <div class="mb-4">
      <span class="tile rounded-full px-3 py-1 font-mono text-[11px] text-white/50">
        Progress: <span class="scroll-y-progress-value"><RowValue :value="scrollYProgress" /></span>
      </span>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-6">
      <div
        ref="containerRef"
        class="scroll-container h-[300px] overflow-y-auto rounded-xl border border-white/[0.06]"
      >
        <div class="flex h-[200px] items-center justify-center text-sm text-white/35">
          Before target
        </div>
        <div
          ref="targetRef"
          class="scroll-target flex h-[150px] items-center justify-center rounded-lg border border-violet-300/20 bg-violet-400/10 text-sm text-violet-100"
        >
          Target
        </div>
        <div class="flex h-[300px] items-center justify-center text-sm text-white/35">
          After target
        </div>
      </div>
    </div>
  </div>
</template>
