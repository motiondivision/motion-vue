<script setup lang="ts">
import { ref } from 'vue'
import { ReorderGroup, ReorderItem } from 'motion-v'

const initialItems = ['🍅 Tomato', '🥒 Cucumber', '🧀 Cheese', '🥬 Lettuce']
const items = ref(initialItems)

function setItems(newItems: string[]) {
  items.value = newItems
}
</script>

<template>
  <Motion />
  <ReorderGroup
    axis="y"
    :values="items"
    class="relative w-[300px]"
    @reorder="setItems"
  >
    <ReorderItem
      v-for="item in items"
      :key="item"
      :value="item"
      class="rounded-lg select-none list-none mb-2 cursor-grab w-full py-4 px-6 bg-purple-500 justify-between flex flex-shrink-0"
    >
      {{ item }}
    </ReorderItem>
  </ReorderGroup>
</template>

<style scoped>
</style>
