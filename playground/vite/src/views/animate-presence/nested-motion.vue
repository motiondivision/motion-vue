<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const show = ref(true)
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Nested motion children"
    description="A presence child fans in every motion element in its subtree, not just the direct child. Nested elements keep their own exit timing."
  >
    <button
      id="toggle"
      class="btn btn-primary mb-4"
      @click="show = !show"
    >
      {{ show ? 'Hide group' : 'Show group' }}
    </button>

    <DemoStage>
      <AnimatePresence>
        <motion.div
          v-if="show"
          id="parent-motion"
          :initial="{ opacity: 0, scale: 0.96 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.96 }"
          :transition="{ duration: 0.28 }"
          class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.05] p-5"
        >
          <h2 class="text-sm font-medium text-white">
            Account
          </h2>

          <motion.div
            id="child-motion-1"
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -16 }"
            :transition="{ duration: 0.22, delay: 0.06 }"
            class="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70"
          >
            Profile
          </motion.div>

          <motion.div
            id="child-motion-2"
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -16 }"
            :transition="{ duration: 0.22, delay: 0.12 }"
            class="mt-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70"
          >
            Security

            <motion.div
              id="grandchild-motion"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              :transition="{ duration: 0.18, delay: 0.08 }"
              class="mt-2 rounded-md border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-200"
            >
              Two-factor authentication
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </DemoStage>
  </DemoPage>
</template>
