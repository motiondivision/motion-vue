<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref([0, 1, 2, 3, 4, 5])
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Reorder
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Auto-detected axis
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        No axis prop. The layout picks horizontal from the row of items.
      </p>
    </header>

    <p
      data-testid="order"
      class="mb-4 font-mono text-xs text-white/35"
    >
      {{ items.join(',') }}
    </p>

    <Reorder.Group
      v-model:values="items"
      class="flex gap-2"
    >
      <Reorder.Item
        v-for="item in items"
        :key="item"
        :value="item"
        :data-testid="`h-${item}`"
        class="tile flex cursor-grab items-center justify-center font-medium active:cursor-grabbing"
        style="list-style: none; width: 80px; height: 80px;"
      >
        {{ item }}
      </Reorder.Item>
    </Reorder.Group>
  </div>
</template>
