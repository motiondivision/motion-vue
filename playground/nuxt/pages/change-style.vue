<script setup>
import { computed, ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import Child from './child.vue'

const visible = ref(false)

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
  <div>
    <button @click="onToggle">
      toggle
    </button>
    <button @click="onMove">
      move
    </button>
    {{ visible }}
    <AnimatePresence>
      <Motion
        as-child
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 1.1 }"
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
