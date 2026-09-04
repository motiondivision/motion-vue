<script setup>
import { computed, ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import Child from './child.vue'

const visible = ref(true)

const position = ref({ top: 100, left: 100 })

const style = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}))

function onToggle() {
  visible.value = !visible.value
}

function onMove() {
  position.value.left += 10
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <button
      class="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
      @click="onToggle"
    >
      toggle
    </button>
    <button
      class="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
      @click="onMove"
    >
      move
    </button>
    <AnimatePresence>
      <Motion
        as-child
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 1.1 }"
        :style="style"
      >
        <Child
          v-show="visible"
        />
      </Motion>
    </AnimatePresence>
  </div>
</template>

  <style scoped>
  .rect {
    position: fixed;
    width: 100px;
    height: 100px;
    background: blue;
  }
  </style>
