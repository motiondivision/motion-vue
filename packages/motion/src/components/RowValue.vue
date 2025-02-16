<script setup generic="T" lang="ts">
import type { MotionValue } from 'framer-motion/dom'
import { getCurrentInstance, watchEffect } from 'vue'

const props = defineProps<{
  value: MotionValue<T>
}>()

const instance = getCurrentInstance().proxy
watchEffect((cleanup) => {
  const unSub = props.value.on('change', (value) => {
    if (instance.$el) {
      instance.$el.textContent = value
    }
  })
  cleanup(unSub)
})
</script>

<template>
  {{ value.get() }}
</template>
