<script setup lang="ts">
import { ref } from 'vue'
// import { ReorderGroup, ReorderItem } from 'motion-v'

const initialItems = ['🍅 Tomato', '🥒 Cucumber', '🧀 Cheese', '🥬 Lettuce']
const items = ref(initialItems)
</script>

<template>
  <div class="flex min-h-[calc(100vh-73px)] items-center justify-center">
    <Motion />
    <ReorderGroup
      v-model:values="items"
      axis="y"
      class="relative w-[300px]"
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
  </div>
</template>

<style scoped>
</style>
