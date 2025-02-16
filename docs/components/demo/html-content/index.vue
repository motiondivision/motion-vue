<script setup lang="ts">
import { RowValue, animate, useMotionValue, useTransform } from 'motion-v'
import { onUnmounted } from 'vue'

const count = useMotionValue(0)
const rounded = useTransform(() => Math.round(count.get()))

let controls: any
watchEffect((cleanup) => {
  controls = animate(count, 100, { duration: 5 })
  cleanup(() => {
    controls?.stop()
  })
})

onUnmounted(() => {
  controls?.stop()
})
</script>

<template>
  <pre
    class="!bg-transparent flex items-center justify-center"
    style="font-size: 64px; color: #4ff0b7;"
  >
    <RowValue :value="rounded" />
  </pre>
</template>
