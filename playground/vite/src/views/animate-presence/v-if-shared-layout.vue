<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'

const showLarge = ref(false)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900">
      v-if Shared Layout Animation Test
    </h1>

    <div class="flex flex-col items-center gap-8">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="showLarge = !showLarge"
      >
        {{ showLarge ? 'Show Small' : 'Show Large' }}
      </button>

      <div
        id="stage"
        class="relative w-full h-[300px]"
      >
        <AnimatePresence>
          <Motion
            v-if="!showLarge"
            id="small-box"
            key="small"
            layout-id="shared-box"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.4 }"
            class="absolute top-0 right-0 w-[100px] h-[100px] bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          >
            Small
          </Motion>
          <Motion
            v-if="showLarge"
            id="large-box"
            key="large"
            layout-id="shared-box"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.4 }"
            class="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold"
          >
            Large Box
          </Motion>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
