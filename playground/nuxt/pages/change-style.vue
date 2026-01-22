<script setup>
import { computed, ref } from 'vue'
import { AnimatePresence } from 'motion-v'
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
  <div>
    <button @click="onToggle">
      toggle
    </button>
    <button @click="onMove">
      move
    </button>
    <!-- <client-only> -->
    <AnimatePresence>
      <Child v-if="visible" />
    </AnimatePresence>
    <!-- </client-only> -->
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
