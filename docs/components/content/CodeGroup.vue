<script setup lang="ts">
import Tabs from './Tabs.vue'

const { inStack = false, sync } = defineProps<{
  inStack?: boolean
  sync?: string
}>()

const _slots = useSlots()
function render() {
  const slots = _slots?.default?.() || []
  return h(
    Tabs,
    {
      variant: 'card',
      inStack,
      sync,
    },
    () => slots,
  )
}
</script>

<template>
  <render />
</template>
