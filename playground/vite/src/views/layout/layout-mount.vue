<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'

const show = ref(false)
</script>

<template>
  <div style="padding: 40px;">
    <button
      id="toggle"
      @click="show = !show"
    >
      Toggle
    </button>

    <!--
      Test: layout element mounting inside a scaling container.
      The outer motion.div animates scale from 0 to 1.
      The inner motion.div has `layout` prop.
      On mount, the inner element should NOT perform a layout animation
      (no translate/scale transforms from projection system).
    -->
    <AnimatePresence>
      <motion.div
        v-if="show"
        id="container"
        :initial="{ scale: 0, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :exit="{ scale: 0, opacity: 0 }"
        :transition="{ duration: 0.3 }"
        style="padding: 20px; background: #eee; margin-top: 20px;"
      >
        <motion.div
          id="layout-child"
          layout
          :initial="false"
          style="width: 100px; height: 100px; background: #4ff0b7;"
        />
      </motion.div>
    </AnimatePresence>
  </div>
</template>
