<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const open = ref(false)
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Shared layout from a persistent trigger"
    description="The trigger stays mounted outside AnimatePresence and never re-renders. The panel shares its layoutId and should grow out of it on open, then shrink back into it on close."
  >
    <DemoStage min-height="320px">
      <div class="relative flex h-[260px] w-full items-center justify-center">
        <Motion
          id="trigger"
          as="button"
          layout-id="panel"
          class="btn btn-primary"
          :style="{ borderRadius: '8px' }"
          @click="open = true"
        >
          Open
        </Motion>
        <AnimatePresence>
          <Motion
            v-if="open"
            id="panel"
            key="panel"
            layout-id="panel"
            class="absolute inset-0 m-auto h-[200px] w-[320px] rounded-xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm text-violet-100"
            :style="{ borderRadius: '12px' }"
            :transition="{ duration: 0.4 }"
          >
            <button
              id="close"
              class="btn"
              @click="open = false"
            >
              Close
            </button>
          </Motion>
        </AnimatePresence>
      </div>
    </DemoStage>
  </DemoPage>
</template>
