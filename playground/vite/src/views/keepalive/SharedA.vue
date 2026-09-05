<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[SharedA] activated'))
onDeactivated(() => console.log('[SharedA] deactivated'))
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
      <motion.div
        layout-id="hero"
        class="hero hero-small"
      />
      <span class="label">List Page — hero is small, top-left</span>
    </motion.div>
  </AnimatePresence>
</template>
