<script setup lang="ts">
import { ref } from 'vue'
import { RowValue, useScroll } from 'motion-v'

const containerRef = ref<HTMLElement>()
const { scrollX, scrollXProgress } = useScroll({ container: containerRef, axis: 'x' })
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Scroll
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Horizontal tracking
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        useScroll reports the container's offset and progress as it moves sideways.
      </p>
    </header>

    <div class="mb-4 flex flex-wrap gap-2">
      <span class="tile rounded-full px-3 py-1 font-mono text-[11px] text-white/50">
        Scroll X: <span class="scroll-x-value"><RowValue :value="scrollX" /></span>
      </span>
      <span class="tile rounded-full px-3 py-1 font-mono text-[11px] text-white/50">
        Progress: <span class="scroll-x-progress-value"><RowValue :value="scrollXProgress" /></span>
      </span>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-6">
      <div
        ref="containerRef"
        class="scroll-container-h h-[100px] w-[300px] overflow-x-auto rounded-xl"
        style="white-space: nowrap;"
      >
        <div
          class="h-[80px] rounded-lg bg-[linear-gradient(to_right,rgba(139,92,246,0.55),rgba(56,189,248,0.35))]"
          style="width: 900px;"
        />
      </div>
    </div>
  </div>
</template>
