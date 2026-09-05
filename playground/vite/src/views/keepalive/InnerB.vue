<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[InnerB] activated'))
onDeactivated(() => console.log('[InnerB] deactivated'))
</script>

<template>
  <AnimatePresence>
    <motion.div
      class="panel panel-b"
      :initial="{ opacity: 0, y: -40 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 40 }"
      :transition="{ duration: 1 }"
    >
      Inner B
    </motion.div>
  </AnimatePresence>
</template>
