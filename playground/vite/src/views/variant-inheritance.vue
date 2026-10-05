<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const parentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
}

const childVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const animate = ref('visible')
function toggle() {
  animate.value = animate.value === 'visible' ? 'hidden' : 'visible'
}
</script>

<template>
  <div style="padding: 40px">
    <button
      data-testid="toggle-btn"
      @click="toggle"
    >
      Toggle
    </button>
    <motion.div
      data-testid="parent"
      initial="hidden"
      :animate="animate"
      :variants="parentVariants"
    >
      <motion.div
        v-for="i in 4"
        :key="i"
        class="stagger-item"
        :variants="childVariants"
        :data-testid="`item-${i}`"
        style="width: 100px; height: 40px; margin-top: 10px; background: #4f46e5; color: #fff"
      >
        Item {{ i }}
      </motion.div>
    </motion.div>
  </div>
</template>
