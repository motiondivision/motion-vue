<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[InnerA] activated'))
onDeactivated(() => console.log('[InnerA] deactivated'))
</script>

<template>
  <AnimatePresence>
    <motion.div
      class="panel panel-a"
      :initial="{ opacity: 0, y: -40 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 40 }"
      :transition="{ duration: 1 }"
    >
      Inner A
    </motion.div>
  </AnimatePresence>
</template>
