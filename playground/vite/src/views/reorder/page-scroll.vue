<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref(Array.from({ length: 30 }, (_, i) => i))
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Reorder
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Page-level auto-scroll
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        There is no overflow container. Drag an item to the bottom edge of the
        window and the page itself scrolls.
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
      axis="y"
      class="w-64 space-y-2"
    >
      <Reorder.Item
        v-for="item in items"
        :key="item"
        :value="item"
        :data-testid="`p-${item}`"
        class="tile cursor-grab rounded-lg px-4 py-3 active:cursor-grabbing"
        style="list-style: none;"
      >
        Item {{ item }}
      </Reorder.Item>
    </Reorder.Group>
  </div>
</template>
