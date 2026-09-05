<script setup lang="ts">
import { motion } from 'motion-v'
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[PanelA] activated'))
onDeactivated(() => console.log('[PanelA] deactivated'))
</script>

<template>
  <motion.div
    class="panel panel-a"
    :initial="{ opacity: 0, y: -40 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: 40 }"
    :transition="{ duration: 1 }"
  >
    Panel A
  </motion.div>
</template>
