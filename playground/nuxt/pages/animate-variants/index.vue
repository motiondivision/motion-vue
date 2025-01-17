<script setup lang="ts">
import { motion } from 'motion-v'
import Test from './Test.vue'

const isOpen = ref(true)

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}
const Custom = motion.create(Test)
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-tr from-[#7b2ff7] to-[#f107a3]">
    <div class="w-full max-w-md space-y-8 p-8">
      <Custom :is-open="123" />
      <button
        class="rounded-lg bg-white/20 px-6 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? 'Close' : 'Open' }}
      </button>

      <Motion
        initial="hidden"
        in-view="visible"
        :variants="container"
        class="grid grid-cols-2 gap-4  p-4 bg-red-500"
      >
        <Motion
          v-for="i in 4"
          :key="i"
          :data-is-open="isOpen"
          :variants="item"
          class="aspect-square rounded-lg bg-white/20 backdrop-blur-sm"
        />
      </Motion>
    </div>
  </div>
</template>
