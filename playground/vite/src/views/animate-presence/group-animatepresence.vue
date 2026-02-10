<script setup lang="ts">
import { AnimatePresence, LayoutGroup, Motion, motion } from 'motion-v'
import { ref } from 'vue'

const open = ref(false)

const toggleOpen = () => open.value = !open.value
</script>

<template>
  <div class="container-outer">
    <LayoutGroup>
      <motion.div
        layout
        class="container"
        :data-open="open"
      >
        <AnimatePresence>
          <Motion
            v-if="open"
            layout
            :exit="{ opacity: 0, y: 50 }"
            :initial="{ opacity: 0, x: 50 }"
            :animate="{ opacity: 1, x: 0 }"
          >
            <pre class="text">
              Some long lines to test
              Some long lines to test
              Some long lines to test
              Some long lines to test
              Some long lines to test
              Some long lines to test
            </pre>
          </Motion>
        </AnimatePresence>

        <Motion layout="position">
          <button @click="toggleOpen">
            Toggle open
          </button>
        </Motion>
      </motion.div>
    </LayoutGroup>
  </div>
</template>

<style scoped>
.container-outer {
  width: 100vw;
  height: 100vh;
}

.container {
  background-color: oklch(0.936 0.032 17.717);
  width: max-content;
}

.text {
  white-space: pre-line;
}
</style>
