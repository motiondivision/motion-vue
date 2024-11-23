<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'
import { useFollowPointer } from './demos/use-follow-pointer.js'

const spring = { damping: 3, stiffness: 50, restDelta: 0.001 }

const boxRef = ref()
const { x, y } = useFollowPointer(boxRef)
</script>

<template>
  <Motion
    ref="boxRef"
    :style="{ x, y }"
  />
  <!-- <Motion
    ref="boxRef"
    class-name="box"
    :style="{ x, y }"
  /> -->
</template>
