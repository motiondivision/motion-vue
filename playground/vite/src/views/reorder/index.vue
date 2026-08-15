<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref([0, 1, 2, 3, 4, 5])
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">
      Reorder Basic (axis auto-detected)
    </h1>
    <p
      data-testid="order"
      class="mb-4 text-sm text-gray-500"
    >
      {{ items.join(',') }}
    </p>

    <Reorder.Group
      v-model:values="items"
      class="space-y-2 w-64"
    >
      <Reorder.Item
        v-for="item in items"
        :key="item"
        :value="item"
        :data-testid="`item-${item}`"
        class="bg-white p-4 rounded shadow-sm border cursor-grab active:cursor-grabbing"
        style="list-style: none;"
      >
        Item {{ item }}
      </Reorder.Item>
    </Reorder.Group>
  </div>
</template>
