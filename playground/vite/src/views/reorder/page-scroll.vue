<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref(Array.from({ length: 30 }, (_, i) => i))
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">
      Reorder Page Scroll (no overflow container)
    </h1>
    <p class="text-sm text-gray-600 mb-4">
      The list is taller than the viewport and the page itself scrolls.
      Drag an item to the bottom edge of the window to scroll the page.
    </p>
    <p
      data-testid="order"
      class="mb-4 text-sm text-gray-500"
    >
      {{ items.join(',') }}
    </p>

    <Reorder.Group
      v-model:values="items"
      axis="y"
      class="space-y-2 w-64"
    >
      <Reorder.Item
        v-for="item in items"
        :key="item"
        :value="item"
        :data-testid="`p-${item}`"
        class="bg-white p-4 rounded shadow-sm border cursor-grab active:cursor-grabbing"
        style="list-style: none;"
      >
        Item {{ item }}
      </Reorder.Item>
    </Reorder.Group>
  </div>
</template>
