<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref([0, 1, 2, 3, 4, 5])
</script>

<template>
  <div
    dir="rtl"
    class="p-8"
  >
    <h1 class="text-2xl font-bold mb-4">
      Reorder RTL Grid (axis="xy")
    </h1>
    <p
      data-testid="order"
      class="mb-4 text-sm text-gray-500"
    >
      {{ items.join(',') }}
    </p>

    <Reorder.Group
      v-model:values="items"
      axis="xy"
      class="flex flex-wrap gap-2"
      style="width: 392px;"
    >
      <Reorder.Item
        v-for="item in items"
        :key="item"
        :value="item"
        :data-testid="`r-${item}`"
        class="bg-white rounded shadow-sm border cursor-grab active:cursor-grabbing flex items-center justify-center font-medium"
        style="list-style: none; width: 120px; height: 80px;"
      >
        {{ item }}
      </Reorder.Item>
    </Reorder.Group>
  </div>
</template>
