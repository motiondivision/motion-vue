<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'

const show = ref(false)
const animationStarted = ref(false)
const animationCompleted = ref(false)

function onAnimationStart() {
  animationStarted.value = true
  animationCompleted.value = false
}

function onAnimationComplete() {
  animationCompleted.value = true
}

function toggle() {
  animationStarted.value = false
  animationCompleted.value = false
  show.value = !show.value
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900">
      v-show Shared Layout Animation Test
    </h1>

    <div class="flex flex-col items-center gap-8">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="toggle"
      >
        {{ show ? 'Show Small' : 'Show Large' }}
      </button>

      <div class="flex gap-4">
        <span id="animation-started">{{ animationStarted ? 'started' : 'idle' }}</span>
        <span id="animation-completed">{{ animationCompleted ? 'completed' : 'pending' }}</span>
      </div>

      <div class="relative w-full h-[300px]">
        <AnimatePresence>
          <Motion
            v-show="show"
            id="large-box"
            layout-id="shared-box"
            :transition="{ duration: 0.3 }"
            class="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold"
            @animation-start="onAnimationStart"
            @animation-complete="onAnimationComplete"
          >
            Large Box
          </Motion>
          <Motion
            v-show="!show"
            id="small-box"
            layout-id="shared-box"
            :transition="{ duration: 0.3 }"
            class="absolute top-0 right-0 w-[100px] h-[100px] bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            @animation-start="onAnimationStart"
            @animation-complete="onAnimationComplete"
          >
            Small
          </Motion>
        </AnimatePresence>
      </div>

      <!-- Test nested shared layout with v-show -->
      <h2 class="text-2xl font-bold mt-8">
        Nested Shared Layout
      </h2>
      <div class="relative w-full h-[200px]">
        <AnimatePresence>
          <Motion
            v-show="show"
            id="nested-large"
            layout-id="nested-container"
            :transition="{ duration: 0.3 }"
            class="absolute bottom-0 left-0 w-[180px] h-[180px] bg-green-500 rounded-lg p-4"
          >
            <Motion
              layout-id="nested-child"
              :transition="{ duration: 0.3 }"
              class="w-[80px] h-[80px] bg-white rounded-md"
            />
          </Motion>
          <Motion
            v-show="!show"
            id="nested-small"
            layout-id="nested-container"
            :transition="{ duration: 0.3 }"
            class="absolute bottom-0 right-0 w-[100px] h-[100px] bg-orange-500 rounded-lg p-2"
          >
            <Motion
              layout-id="nested-child"
              :transition="{ duration: 0.3 }"
              class="w-[40px] h-[40px] bg-white rounded-md"
            />
          </Motion>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
