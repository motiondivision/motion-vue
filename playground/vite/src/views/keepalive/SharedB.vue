<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[SharedB] activated'))
onDeactivated(() => console.log('[SharedB] deactivated'))
</script>

<template>
  <AnimatePresence>
    <motion.div
      class="shared-page"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.6 }"
    >
      <span class="label">Detail Page — hero is large, bottom-right</span>
      <motion.div
        layout-id="hero"
        class="hero hero-large"
      />
    </motion.div>
  </AnimatePresence>
</template>
