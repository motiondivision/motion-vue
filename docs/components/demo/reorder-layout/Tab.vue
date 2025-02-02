<script setup lang="ts">
import type { Ingredient } from './ingredients'
import { Cross2Icon } from '@radix-icons/vue'
import { ReorderItem, motion } from 'motion-v'

const { item, isSelected } = defineProps<{
  item: Ingredient
  isSelected: boolean
}>()

defineEmits<{
  (e: 'click'): void
  (e: 'remove'): void
}>()
</script>

<template>
  <ReorderItem
    :id="item.label"
    :value="item"
    :initial="{ opacity: 0 }"
    :animate="{
      opacity: 1,
      backgroundColor: isSelected ? '#f3f3f3' : '#fff',
      y: 0,
      transition: { duration: 0.15 },
    }"
    :exit="{ opacity: 0, y: 20, transition: { duration: 0.3 } }"
    :while-drag="{ backgroundColor: '#e3e3e3' }"
    :class="{ selected: isSelected }"
    @pointerdown="$emit('click')"
  >
    <motion.span layout>
      {{ item.icon }} {{ item.label }}
    </motion.span>
    <motion.div
      layout
      class="close"
    >
      <motion.button
        :initial="false"
        :animate="{ backgroundColor: isSelected ? '#e3e3e3' : '#fff' }"
        @pointerdown.stop="$emit('remove')"
      >
        <Cross2Icon class="w-4 h-4" />
      </motion.button>
    </motion.div>
  </ReorderItem>
</template>
