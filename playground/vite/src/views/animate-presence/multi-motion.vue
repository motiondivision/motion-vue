<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'

const show = ref(true)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900">
      Multiple Motion Components Test
    </h1>

    <div class="flex flex-col items-center gap-8">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="show = !show"
      >
        {{ show ? 'Hide' : 'Show' }}
      </button>

      <div class="w-full max-w-md">
        <AnimatePresence>
          <div
            v-if="show"
            class="space-y-4"
          >
            <motion.div
              id="motion-1"
              :initial="{ opacity: 0, x: -50 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: -50 }"
              :transition="{ duration: 0.3 }"
              class="bg-blue-500 text-white rounded-lg p-4"
            >
              Motion Component 1
            </motion.div>

            <motion.div
              id="motion-2"
              :initial="{ opacity: 0, x: -50 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: 50 }"
              :transition="{ duration: 0.3, delay: 0.1 }"
              class="bg-green-500 text-white rounded-lg p-4"
            >
              Motion Component 2
            </motion.div>

            <motion.div
              id="motion-3"
              :initial="{ opacity: 0, x: -50 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, y: 50 }"
              :transition="{ duration: 0.3, delay: 0.2 }"
              class="bg-purple-500 text-white rounded-lg p-4"
            >
              Motion Component 3
            </motion.div>
          </div>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
