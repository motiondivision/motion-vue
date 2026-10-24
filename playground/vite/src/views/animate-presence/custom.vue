<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import StatusPill from '@/components/StatusPill.vue'

const pages = [
  { id: 'overview', title: 'Overview', body: 'A direction-aware page transition. The exit resolver reads the custom value.' },
  { id: 'activity', title: 'Activity', body: 'custom is passed through the presence context to every exit variant function.' },
  { id: 'settings', title: 'Settings', body: 'Moving backwards reverses the exit direction without any extra state.' },
]

const resolveExit = (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 })

const index = ref(0)
const direction = ref(1)

function go(step: number) {
  direction.value = step
  index.value = (index.value + step + pages.length) % pages.length
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Direction-aware exit with custom"
    description="The custom prop travels with the presence context. Exit variant functions receive it, so the leaving page slides the way you navigated."
  >
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <button
        id="prev"
        class="btn btn-outline"
        @click="go(-1)"
      >
        Previous
      </button>
      <button
        id="next"
        class="btn btn-primary"
        @click="go(1)"
      >
        Next
      </button>
      <StatusPill
        :label="direction > 0 ? 'forward' : 'backward'"
        :tone="direction > 0 ? 'accent' : 'idle'"
      />
    </div>

    <DemoStage min-height="240px">
      <div class="relative h-[160px] w-full max-w-sm overflow-hidden">
        <AnimatePresence
          mode="wait"
          :custom="direction"
        >
          <Motion
            :id="`page-${pages[index].id}`"
            :key="pages[index].id"
            :variants="{ exit: resolveExit }"
            :initial="{ opacity: 0, x: direction * 32 }"
            :animate="{ opacity: 1, x: 0 }"
            exit="exit"
            :transition="{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }"
            class="absolute inset-0 flex flex-col justify-center rounded-xl border border-white/10 bg-white/[0.06] px-6"
          >
            <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
              {{ index + 1 }} / {{ pages.length }}
            </span>
            <span class="mt-2 text-lg font-medium text-white">{{ pages[index].title }}</span>
            <p class="mt-1 max-w-[38ch] text-sm leading-relaxed text-white/50">
              {{ pages[index].body }}
            </p>
          </Motion>
        </AnimatePresence>
      </div>
    </DemoStage>
  </DemoPage>
</template>
