<script setup lang="ts">
import { ref } from 'vue'
import { MotionConfig, motion } from '@/components'

const show = ref(true)
const toggle = () => (show.value = !show.value)
const variants = {
  initial: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  hidden: { y: 0, opacity: 0.25 },
}
</script>

<template>
  <MotionConfig reduced-motion="always">
    <div style="padding: 40px">
      <button
        data-testid="toggle-btn"
        @click="toggle"
      >
        Toggle
      </button>
      <motion.button
        data-testid="motion-btn"
        initial="initial"
        :variants="variants"
        :while-in-view="show ? 'visible' : 'hidden'"
        style="width: 120px; height: 40px; margin-top: 20px"
      >
        CLICK ME
      </motion.button>
    </div>
  </MotionConfig>
</template>
