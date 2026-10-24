<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const showLarge = ref(false)
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Shared layout across v-if"
    description="Both states carry the same layoutId. AnimatePresence keeps the outgoing element measurable long enough for the shared layout handoff."
  >
    <div class="mb-4">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="showLarge = !showLarge"
      >
        {{ showLarge ? 'Show small' : 'Show large' }}
      </button>
    </div>

    <DemoStage min-height="320px">
      <div
        id="stage"
        class="relative h-[260px] w-full"
      >
        <AnimatePresence>
          <Motion
            v-if="!showLarge"
            id="small-box"
            key="small"
            layout-id="shared-box"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
            class="absolute right-4 top-4 flex h-[100px] w-[100px] items-end rounded-lg border border-white/10 bg-white/[0.07] p-3 text-xs text-white/60"
          >
            Small
          </Motion>
          <Motion
            v-if="showLarge"
            id="large-box"
            key="large"
            layout-id="shared-box"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
            class="absolute left-4 top-4 flex h-[200px] w-[200px] items-end rounded-xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm text-violet-100"
          >
            Large
          </Motion>
        </AnimatePresence>
      </div>
    </DemoStage>
  </DemoPage>
</template>
