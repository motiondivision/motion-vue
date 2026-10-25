<script setup lang="ts">
import type { Component } from 'vue'
import { ref } from 'vue'
import { AnimatePresence } from '@/components'

defineProps<{ item: Component }>()

const show = ref(true)

defineExpose({ show })
</script>

<template>
  <!-- eslint-disable vue/no-unused-refs -- the test reads `box` through $refs to cover a string ref -->
  <AnimatePresence>
    <component
      :is="item"
      v-if="show"
      ref="box"
      class="box"
    />
  </AnimatePresence>
</template>

<style scoped>
.box {
  color: red;
}
</style>
