<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import StatusPill from '@/components/StatusPill.vue'

const show = ref(true)
const exitComplete = ref(false)

function toggle() {
  show.value = !show.value
  exitComplete.value = false
}

function onExitComplete() {
  exitComplete.value = true
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="One presence, many exits"
    description="Every motion child in the subtree registers with the same presence child. onExitComplete fires once all of their exits settle."
  >
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="toggle"
      >
        {{ show ? 'Hide cards' : 'Show cards' }}
      </button>
      <StatusPill
        id="exit-status"
        :label="exitComplete ? 'exited' : 'present'"
        :tone="exitComplete ? 'accent' : 'idle'"
      />
    </div>

    <DemoStage align="start">
      <AnimatePresence @exit-complete="onExitComplete">
        <div
          v-if="show"
          class="flex w-full flex-col gap-3"
        >
          <motion.div
            id="motion-1"
            :initial="{ opacity: 0, x: -32 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -32 }"
            :transition="{ duration: 0.28 }"
            class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4"
          >
            <span class="text-sm text-white/80">Preferences</span>
            <span class="font-mono text-[11px] text-white/30">01</span>
          </motion.div>

          <motion.div
            id="motion-2"
            :initial="{ opacity: 0, x: -32 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 32 }"
            :transition="{ duration: 0.28, delay: 0.08 }"
            class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4"
          >
            <span class="text-sm text-white/80">Appearance</span>
            <span class="font-mono text-[11px] text-white/30">02</span>
          </motion.div>

          <motion.div
            id="motion-3"
            :initial="{ opacity: 0, x: -32 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, y: 24 }"
            :transition="{ duration: 0.28, delay: 0.16 }"
            class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4"
          >
            <span class="text-sm text-white/80">Notifications</span>
            <span class="font-mono text-[11px] text-white/30">03</span>
          </motion.div>
        </div>
      </AnimatePresence>
    </DemoStage>
  </DemoPage>
</template>
