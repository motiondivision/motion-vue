<script setup lang="ts">
import TabsInner from './TabsInner.vue'

const {
  variant = 'separate',
  padded = true,
  inStack = false,
  disableSearch = false,
  searchPlaceholder = 'Search Tab...',
  searchEmpty = 'No tab found.',
  sync,
} = defineProps<{
  variant?: 'separate' | 'card' | 'line' | 'combobox'
  padded?: boolean
  inStack?: boolean
  disableSearch?: boolean
  searchPlaceholder?: string
  searchEmpty?: string
  sync?: string
}>()

const _slots = useSlots()
function render() {
  const slots = _slots?.default?.() || []

  const slotsData = slots.map(
    (slot, index) => ({
      label: slot.props?.label || slot.props?.filename || '',
      index,
    }),
  )

  return h(
    TabsInner,
    {
      variant,
      padded,
      inStack,
      disableSearch,
      searchEmpty,
      searchPlaceholder,
      slotsData,
      sync,
    },
    () => slots,
  )
}
</script>

<template>
  <render />
</template>
