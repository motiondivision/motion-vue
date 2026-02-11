<script setup lang="ts">
import { Motion } from 'motion-v'

const items = [
  { id: 1, text: 'Fade in when in view' },
  { id: 2, text: 'Scale up when in view' },
  { id: 3, text: 'Slide in when in view' },
]
</script>

<template>
  <div class="space-y-32  max-w-2xl mx-auto pt-[1000px]">
    <Motion
      v-for="item in items"
      :key="item.id"
      :initial="{ opacity: 0, y: 50 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :in-view-options="{ once: true }"
      :transition="{ duration: 0.8 }"
      class="p-8 bg-white/5 rounded-lg"
      @viewport-enter="console.log('enter')"
      @viewport-leave="console.log('leave')"
    >
      <h2 class="text-2xl font-bold">
        {{ item.text }}
      </h2>
      <p class="mt-4 text-gray-400">
        Scroll down to see more items animate in as they enter the viewport. Each item animates independently using the inView prop.
      </p>
    </Motion>
  </div>
</template>
