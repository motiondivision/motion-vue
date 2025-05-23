<script setup>
import { motion, useMotionValue, useScroll } from 'motion-v'

const { scrollYProgress } = useScroll()
const x = useMotionValue(0)
</script>

<template>
  <motion.div
    :style="{
      width: '100px',
      height: '100px',
      backgroundColor: 'red',
      x: scrollYProgress,
      y: x,
    }"
  />
</template>
