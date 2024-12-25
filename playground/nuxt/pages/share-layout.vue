<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { Motion, MotionConfig } from 'motion-v'

const show = ref(false)
useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    show.value = false
  }
})
</script>

<template>
  <div class="h-screen w-screen bg-gradient-to-br flex items-center justify-center from-indigo-500 via-purple-500 to-pink-500">
    <MotionConfig :transition="{ layout: { duration: 3 } }">
      <Motion
        v-if="!show"
        layout-id="test"
        class="w-[100px] h-[100px] bg-white rounded-md"
        @click="show = !show"
      >
        <Motion
          layout-id="test2"
        >
          <Motion
            as="p"
            layout
          >
            Hello
          </Motion>
        </Motion>
      </Motion>

      <!-- <AnimatePresence> -->
      <Motion
        v-if="show"
        layout-id="test"
        class="w-[200px] h-[200px] fixed top-0 left-0 bg-white rounded-md"
        @click="show = !show"
      >
        <Motion
          layout-id="test2"
        >
          <Motion
            as="p"
            layout
          >
            Hello
          </Motion>
        </Motion>
      </Motion>
      <!-- </AnimatePresence> -->
    </MotionConfig>
  </div>
</template>

<style scoped>

</style>
