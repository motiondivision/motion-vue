<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { LayoutGroup, Motion, MotionConfig } from 'motion-v'

const show = ref(false)
useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    show.value = false
  }
})
</script>

<template>
  <div class="h-screen w-screen bg-gradient-to-br flex items-center justify-center from-indigo-500 via-purple-500 to-pink-500">
    <MotionConfig>
      <LayoutGroup>
        <AnimatePresence>
          <Motion
            v-if="show"
            layout-id="test"
            :transition="{ duration: 3 }"
            class="w-[200px] h-[200px] fixed top-0 left-0 bg-white rounded-md"
            @click="show = !show"
          >
            <Motion
              layout-id="test-1"
              class="w-[100px] h-[100px] bg-white rounded-md"
              :transition="{ duration: 3 }"
            >
              wahaha
            </Motion>
          </Motion>
          <Motion
            v-else
            layout-id="test"
            class="w-[100px] h-[100px] bg-white rounded-md"
            :transition="{ duration: 3 }"
            @click="() => {
              show = !show
            }"
          >
            <Motion
              layout-id="test-1"
              class="w-[100px] h-[100px] bg-white rounded-md"
              :transition="{ duration: 3 }"
            >
              wahaha
            </Motion>
          </Motion>
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  </div>
</template>

<style scoped>

</style>
