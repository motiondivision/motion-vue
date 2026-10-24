<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, LayoutGroup, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const page = ref<'a' | 'b'>('a')
const show = ref(true)
const items = ref([1, 2, 3])

const panel = {
  a: { title: 'Panel A', caption: 'The incoming child waits.' },
  b: { title: 'Panel B', caption: 'Only then does it enter.' },
}

function switchPage() {
  page.value = page.value === 'a' ? 'b' : 'a'
}

function removeFirst() {
  items.value = items.value.slice(1)
}

function resetItems() {
  items.value = [1, 2, 3]
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Wait mode and interruption"
    description="Wait mode holds the incoming child until the outgoing one finishes. Re-enter mid-exit cancels the departure instead of remounting."
  >
    <section class="mb-12">
      <h2 class="mb-3 text-sm font-medium text-white/70">
        Page switch
      </h2>
      <div class="mb-4">
        <button
          id="switch-page"
          class="btn btn-primary"
          @click="switchPage"
        >
          Switch to {{ page === 'a' ? 'B' : 'A' }}
        </button>
      </div>
      <DemoStage min-height="200px">
        <div
          id="wait-stage"
          class="relative h-[150px] w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            <Motion
              :id="`panel-${page}`"
              :key="page"
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -12 }"
              :transition="{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }"
              class="absolute inset-0 flex flex-col justify-center rounded-xl border border-white/10 bg-white/[0.06] px-6"
            >
              <span class="text-lg font-medium text-white">{{ panel[page].title }}</span>
              <span class="mt-1 text-sm text-white/45">{{ panel[page].caption }}</span>
            </Motion>
          </AnimatePresence>
        </div>
      </DemoStage>
    </section>

    <section class="mb-12">
      <h2 class="mb-3 text-sm font-medium text-white/70">
        Interrupt mid-exit
      </h2>
      <div class="mb-4">
        <button
          id="toggle-show"
          class="btn btn-primary"
          @click="show = !show"
        >
          {{ show ? 'Hide' : 'Show' }}
        </button>
      </div>
      <DemoStage min-height="160px">
        <div
          id="interrupt-stage"
          class="relative h-[110px] w-full max-w-sm"
        >
          <AnimatePresence>
            <Motion
              v-if="show"
              id="interrupt-item"
              key="interrupt"
              :initial="{ opacity: 0, scale: 0.97 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.97 }"
              :transition="{ duration: 0.6, ease: 'easeInOut' }"
              class="absolute inset-0 flex items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-sm text-violet-100"
            >
              Toggle again while this is leaving
            </Motion>
          </AnimatePresence>
        </div>
      </DemoStage>
    </section>

    <section>
      <h2 class="mb-3 text-sm font-medium text-white/70">
        List removal with layout siblings
      </h2>
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          id="remove-first"
          class="btn btn-primary"
          @click="removeFirst"
        >
          Remove first
        </button>
        <button
          id="reset-items"
          class="btn btn-outline"
          @click="resetItems"
        >
          Reset
        </button>
      </div>
      <DemoStage>
        <LayoutGroup>
          <ul
            id="layout-list"
            class="m-0 flex w-[280px] list-none flex-col gap-3 p-0"
          >
            <AnimatePresence>
              <Motion
                v-for="id in items"
                :id="`list-item-${id}`"
                :key="id"
                layout
                as="li"
                :initial="{ opacity: 0, scale: 0.96 }"
                :animate="{ opacity: 1, scale: 1 }"
                :exit="{ opacity: 0, scale: 0.94 }"
                :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
                class="flex h-14 items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-5 text-sm text-white/75"
              >
                <span>Item {{ id }}</span>
                <span class="font-mono text-[11px] text-white/30">0{{ id }}</span>
              </Motion>
            </AnimatePresence>
          </ul>
        </LayoutGroup>
      </DemoStage>
    </section>
  </DemoPage>
</template>
