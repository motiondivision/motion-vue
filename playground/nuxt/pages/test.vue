<script setup>
import { Motion, useMotionValue, useSpring } from 'motion-v'
import Child from './child.vue'
import { useSlotChangeIndex } from './use-test'

const count = ref(0)
const slotChangeIndex = useSlotChangeIndex()
const isShow = ref(false)
</script>

<template>
  <AnimatePresence :initial="false">
    <Motion
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      class="w-[100px] h-[100px] bg-red-500"
    />
  </AnimatePresence>
</template>
