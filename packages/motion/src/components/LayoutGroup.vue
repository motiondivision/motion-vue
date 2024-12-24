<script setup lang="ts">
import { onBeforeUpdate, onUpdated } from 'vue'
import { type LayoutGroupProps, useLayoutGroup } from './use-layout-group'
import { frame } from 'framer-motion/dom'

const props = defineProps<LayoutGroupProps>()
useLayoutGroup(props)

onBeforeUpdate(() => {
  console.log('onBeforeUpdate')
})
onUpdated(() => {
  frame.read(() => {})
})
</script>

<template>
  <slot />
</template>
