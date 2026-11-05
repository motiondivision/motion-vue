<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
}

const items = ref([1, 2])

function add() {
  items.value.push(items.value.length + 1)
}
</script>

<template>
  <div style="padding: 40px">
    <button
      data-testid="add-btn"
      @click="add"
    >
      Add
    </button>
    <motion.div
      data-testid="parent"
      initial="hidden"
      while-in-view="visible"
      :variants="variants"
    >
      <motion.div
        v-for="i in items"
        :key="i"
        :data-testid="`item-${i}`"
        :variants="variants"
        style="width: 100px; height: 40px; margin-top: 10px; background: #4f46e5"
      >
        Item {{ i }}
      </motion.div>
    </motion.div>
  </div>
</template>
