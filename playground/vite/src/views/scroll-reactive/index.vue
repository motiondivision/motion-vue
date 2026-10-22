<script setup lang="ts">
import { ref } from 'vue'
import { RowValue, useScroll } from 'motion-v'

const axis = ref<'x' | 'y'>('y')
const containerRef = ref<HTMLElement>()
const { scrollX, scrollXProgress, scrollY, scrollYProgress } = useScroll(
  () => ({ container: containerRef.value ? containerRef : undefined, axis: axis.value }),
)

function toggleAxis() {
  axis.value = axis.value === 'y' ? 'x' : 'y'
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Scroll
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Reactive axis
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        The axis is a getter, so useScroll re-subscribes when it changes.
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <button
        class="toggle-axis btn btn-primary"
        @click="toggleAxis"
      >
        Toggle axis
      </button>
      <span class="tile rounded-full px-3 py-1 font-mono text-[11px] text-white/50">
        current: <span class="current-axis text-white/75">{{ axis }}</span>
      </span>
    </div>

    <div class="mb-4 grid grid-cols-2 gap-2">
      <span class="tile rounded-lg px-3 py-2 font-mono text-[11px] text-white/45">
        Scroll Y: <span class="scroll-y-value"><RowValue :value="scrollY" /></span>
      </span>
      <span class="tile rounded-lg px-3 py-2 font-mono text-[11px] text-white/45">
        Scroll X: <span class="scroll-x-value"><RowValue :value="scrollX" /></span>
      </span>
      <span class="tile rounded-lg px-3 py-2 font-mono text-[11px] text-white/45">
        Progress Y: <span class="scroll-y-progress-value"><RowValue :value="scrollYProgress" /></span>
      </span>
      <span class="tile rounded-lg px-3 py-2 font-mono text-[11px] text-white/45">
        Progress X: <span class="scroll-x-progress-value"><RowValue :value="scrollXProgress" /></span>
      </span>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-6">
      <div
        ref="containerRef"
        class="scroll-container h-[300px] w-[300px] overflow-auto rounded-xl"
      >
        <div
          class="rounded-lg bg-[linear-gradient(135deg,rgba(139,92,246,0.5),rgba(56,189,248,0.3))]"
          style="width: 900px; height: 900px;"
        />
      </div>
    </div>
  </div>
</template>
