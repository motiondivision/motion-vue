<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
const items2 = ref(['1-A', '2-B', '3-C', '4-D', '5-E', '6-F', '7-G', '8-H', '9-I', '10-J', '11-K', '12-L', '13-M', '14-N', '15-O'])
</script>

<template>
  <div class="p-8">
    <div class="border p-4 rounded">
      <h1 class="text-2xl font-bold mb-4">
        Reorder Auto-Scroll Test
      </h1>
      <p class="text-sm text-gray-600 mb-4">
        Drag items to the top or bottom edge of the container to trigger auto-scroll.
      </p>
    </div>

    <div class="border p-4 rounded mt-4">
      <h2 class="text-lg font-semibold mb-2">
        Vertical Reorder with Auto-Scroll
      </h2>
      <p class="text-sm text-gray-600 mb-4">
        Container height: 300px. Drag items near top/bottom edges to scroll.
      </p>

      <div
        data-testid="scroll-container"
        class="border rounded bg-gray-50"
        style="height: 300px; overflow-y: auto;"
      >
        <Reorder.Group
          v-model:values="items"
          axis="y"
          class="p-4 space-y-2"
        >
          <Reorder.Item
            v-for="item in items"
            :key="item"
            :value="item"
            :data-testid="item.toString()"
            class="bg-white p-4 rounded shadow-sm border cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
            style="list-style: none;"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">Item {{ item }}</span>
              <span class="text-gray-400">↕️</span>
            </div>
          </Reorder.Item>
        </Reorder.Group>
      </div>
    </div>

    <div class="border p-4 rounded mt-4">
      <h2 class="text-lg font-semibold mb-2">
        Horizontal Reorder with Auto-Scroll
      </h2>
      <p class="text-sm text-gray-600 mb-4">
        Container width: 500px. Drag items near left/right edges to scroll.
      </p>

      <div
        data-testid="horizontal-scroll-container"
        class="border rounded bg-gray-50"
        style="width: 100%; overflow-x: auto;"
      >
        <Reorder.Group
          v-model:values="items2"
          axis="x"
          class="p-4 flex"
          style="min-width: max-content;"
        >
          <Reorder.Item
            v-for="item in items2"
            :key="item"
            :value="item"
            :data-testid="`h-${item}`"
            class="bg-white p-4 rounded shadow-sm border cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors flex-shrink-0 mr-2"
            style="list-style: none; width: 120px;"
          >
            <div class="flex flex-col items-center gap-2">
              <span class="font-medium">Item {{ item }}</span>
              <span class="text-gray-400">↔️</span>
            </div>
          </Reorder.Item>
        </Reorder.Group>
      </div>
    </div>
  </div>
</template>
