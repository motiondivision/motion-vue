<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'

const show = ref(false)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900">
      AnimatePresence Demo
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
          >
            <motion.div
              id="animate-presence-item"
              :initial="false"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: 50 }"
              class="bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center"
            >
              <button
                class="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </motion.div>
          </div>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
