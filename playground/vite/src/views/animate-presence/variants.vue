<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion, stagger } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const isVisible = ref(true)

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: 8 },
}

const listVariants = {
  open: {
    opacity: 1,
    transition: { delayChildren: stagger(0.06), when: 'beforeChildren' },
  },
  closed: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      delayChildren: stagger(0.05, { from: 'last' }),
    },
  },
}

const tiles = ['Discover', 'Compose', 'Publish']
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Exit as a variant"
    description="The exiting element owns a variant tree. Exit propagates to its children, and afterChildren lets the tiles leave in reverse order."
  >
    <div class="mb-4">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="isVisible = !isVisible"
      >
        {{ isVisible ? 'Hide grid' : 'Show grid' }}
      </button>
    </div>

    <DemoStage>
      <AnimatePresence :initial="false">
        <motion.ul
          v-if="isVisible"
          id="variant-grid"
          initial="closed"
          animate="open"
          exit="closed"
          :variants="listVariants"
          :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
          class="m-0 grid w-full max-w-sm list-none grid-cols-3 gap-3 p-0"
        >
          <motion.li
            v-for="tile in tiles"
            :key="tile"
            :variants="itemVariants"
            class="flex h-24 flex-col justify-end rounded-xl border border-white/10 bg-white/[0.06] p-4"
          >
            <span class="text-sm text-white/75">{{ tile }}</span>
            <span class="mt-1 font-mono text-[10px] text-white/30">tile</span>
          </motion.li>
        </motion.ul>
      </AnimatePresence>
    </DemoStage>
  </DemoPage>
</template>
