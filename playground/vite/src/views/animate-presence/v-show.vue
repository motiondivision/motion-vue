<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import StatusPill from '@/components/StatusPill.vue'

const show = ref(true)
const exitCount = ref(0)
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Visibility with v-show"
    description="v-show never unmounts, so AnimatePresence drives the exit through Vue's transition hooks and only then applies display: none."
  >
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="show = !show"
      >
        {{ show ? 'Hide' : 'Show' }}
      </button>
      <StatusPill
        :label="show ? 'visible' : 'hidden'"
        :tone="show ? 'idle' : 'accent'"
      />
      <span class="font-mono text-[11px] text-white/30">exit completions</span>
      <StatusPill
        id="exit-count"
        :label="String(exitCount)"
      />
    </div>

    <DemoStage>
      <AnimatePresence @exit-complete="() => exitCount++">
        <Motion
          v-show="show"
          id="v-show-item"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: 24 }"
          :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
          class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.06] p-5"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-white">Still in the DOM</span>
            <span class="font-mono text-[11px] text-white/35">v-show</span>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-white/50">
            The element keeps its state while hidden. Only the visibility
            changes, after the exit finishes.
          </p>
        </Motion>
      </AnimatePresence>
    </DemoStage>
  </DemoPage>
</template>
