<script setup lang="ts">
import { watch } from 'vue'
import { Motion, useAnimate, useInView } from 'motion-v'

const [scope, animate] = useAnimate()
const isInView = useInView(scope)

watch(isInView, () => {
  if (isInView.value) {
    animate(scope.value, { opacity: 1, y: 0 }, {
      duration: 1,
    })
  }
}, { immediate: true })
</script>

<template>
  <Motion
    ref="scope"
    :initial="{ opacity: 0, y: 30 }"
    class="bg-primary p-4 rounded w-20 h-20"
  />
</template>
