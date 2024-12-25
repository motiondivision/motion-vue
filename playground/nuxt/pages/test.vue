<script setup>
import { Motion, useMotionValue, useSpring } from 'motion-v'
import Child from './child.vue'
import { useSlotChangeIndex } from './use-test'

const count = ref(0)
const slotChangeIndex = useSlotChangeIndex()
</script>

<template>
  <button @click="count++">
    {{ count }} -{{ slotChangeIndex }}
  </button>
  <Child />
</template>
