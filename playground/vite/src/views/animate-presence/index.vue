<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import StatusPill from '@/components/StatusPill.vue'

const show = ref(true)
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Exit animations for v-if"
    description="AnimatePresence keeps a child mounted until its exit animation settles. Flip the boolean and the card leaves instead of disappearing."
  >
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="show = !show"
      >
        {{ show ? 'Hide card' : 'Show card' }}
      </button>
      <StatusPill
        :label="show ? 'present' : 'exiting'"
        :tone="show ? 'idle' : 'accent'"
      />
    </div>

    <DemoStage>
      <AnimatePresence>
        <Motion
          v-if="show"
          id="animate-presence-item"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 12 }"
          :transition="{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }"
          class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.06] p-5"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-white">Weekly summary</span>
            <span class="font-mono text-[11px] text-white/35">now</span>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-white/50">
            This card is still mounted while it fades and slides away.
          </p>
        </Motion>
      </AnimatePresence>
    </DemoStage>
  </DemoPage>
</template>
