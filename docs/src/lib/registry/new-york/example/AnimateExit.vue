<script setup lang="ts">
import type { DOMKeyframesDefinition } from 'framer-motion'
import { AnimatePresence, Motion } from 'motion-v'
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <div class="w-1/3">
    <AnimatePresence>
      <Motion
        v-show="show"
        class="bg-primary  aspect-square rounded-2xl"
        :initial="{ scale: 0 }"
        :animate="{ rotate: 180, scale: 1 }"
        :exit="{ rotate: 0, scale: 0 }"
        :transition="{
          // type: 'spring',
          // stiffness: 260,
          // damping: 20,
          duration: 10,
        }"
      />
    </AnimatePresence>
    <button @click="show = !show">
      {{ show ? 'hide' : 'show' }}
    </button>
  </div>
</template>
