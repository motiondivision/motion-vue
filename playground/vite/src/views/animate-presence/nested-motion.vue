<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'

const show = ref(true)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900">
      Nested Motion Components Test
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
          <motion.div
            v-if="show"
            id="parent-motion"
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.9 }"
            :transition="{ duration: 0.3 }"
            class="bg-gray-100 rounded-lg p-6 space-y-4"
          >
            <h2 class="text-xl font-semibold">
              Parent Motion
            </h2>

            <motion.div
              id="child-motion-1"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -20 }"
              :transition="{ duration: 0.2, delay: 0.1 }"
              class="bg-blue-500 text-white rounded p-3"
            >
              Child Motion 1
            </motion.div>

            <motion.div
              id="child-motion-2"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -20 }"
              :transition="{ duration: 0.2, delay: 0.2 }"
              class="bg-green-500 text-white rounded p-3"
            >
              Child Motion 2

              <motion.div
                id="grandchild-motion"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.15, delay: 0.1 }"
                class="mt-2 bg-green-700 rounded p-2 text-sm"
              >
                Grandchild Motion
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
