<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const count = ref(0)
const items = ref([0])
const popLayout = ref(false)

function addItem() {
  count.value++
  items.value = [...items.value, count.value]
}

function removeItemById(id: number) {
  items.value = items.value.filter(item => item !== id)
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="popLayout mode"
    description="The exiting row is pulled out of flow with absolute positioning, so its siblings close the gap immediately while it animates away."
  >
    <div class="mb-4 flex flex-wrap items-center gap-4">
      <Motion
        as="button"
        :initial="{ scale: 1 }"
        :while-press="{ scale: 0.96 }"
        class="btn btn-primary"
        @click="addItem"
      >
        Add item
      </Motion>

      <label class="flex cursor-pointer items-center gap-2 text-sm text-white/60">
        <input
          v-model="popLayout"
          type="checkbox"
          class="h-4 w-4 cursor-pointer appearance-none rounded border border-white/20 bg-white/[0.06] transition-colors checked:border-violet-300/50 checked:bg-violet-400/70"
        >
        <span class="font-mono text-xs">popLayout</span>
      </label>
    </div>

    <DemoStage min-height="320px">
      <AnimatePresence
        :mode="popLayout ? 'popLayout' : 'sync'"
        as="ul"
        class="m-0 flex w-full max-w-sm list-none flex-col gap-3 p-0"
      >
        <div
          v-for="id in items"
          :key="id"
        >
          <Motion
            as="li"
            :initial="{ scale: 0.96, opacity: 0 }"
            :animate="{ scale: 1, opacity: 1 }"
            :exit="{ scale: 0.96, opacity: 0 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
            :layout="true"
            class="flex h-20 cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-5 text-sm text-white/75"
            @click="removeItemById(id)"
          >
            <span>Item {{ id }}</span>
            <span class="font-mono text-[11px] text-white/30">click to remove</span>
          </Motion>
        </div>
      </AnimatePresence>
    </DemoStage>
  </DemoPage>
</template>
