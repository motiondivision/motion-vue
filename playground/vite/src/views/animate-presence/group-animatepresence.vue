<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, LayoutGroup, Motion, motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

const open = ref(false)

const toggleOpen = () => open.value = !open.value
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Exit inside a LayoutGroup"
    description="The container measures its size through layout. When the content exits, the container animates to its new height instead of snapping."
  >
    <DemoStage>
      <LayoutGroup>
        <motion.div
          layout
          class="container w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]"
          :data-open="open"
        >
          <AnimatePresence>
            <Motion
              v-if="open"
              layout
              :initial="{ opacity: 0, y: -8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -8 }"
              :transition="{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }"
              class="border-b border-white/10 px-5 py-4"
            >
              <p class="text-sm leading-relaxed text-white/55">
                The container keeps its layout animation while this panel
                leaves. Siblings never jump to their new position.
              </p>
            </Motion>
          </AnimatePresence>

          <Motion
            layout="position"
            class="px-5 py-4"
          >
            <button
              class="text-sm font-medium text-white/80 transition-colors hover:text-white"
              @click="toggleOpen"
            >
              Toggle open
            </button>
          </Motion>
        </motion.div>
      </LayoutGroup>
    </DemoStage>
  </DemoPage>
</template>
