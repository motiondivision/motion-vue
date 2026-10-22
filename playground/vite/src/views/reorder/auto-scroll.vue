<script setup lang="ts">
import { ref } from 'vue'
import { Reorder } from 'motion-v'

const items = ref([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
const items2 = ref(['1-A', '2-B', '3-C', '4-D', '5-E', '6-F', '7-G', '8-H', '9-I', '10-J', '11-K', '12-L', '13-M', '14-N', '15-O'])
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Reorder
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Auto-scroll at the edges
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        Drag an item to the top or bottom edge to scroll the container.
      </p>
    </header>

    <section class="mb-8">
      <h2 class="mb-2 text-sm font-medium text-white/70">
        Vertical
      </h2>
      <p class="mb-3 text-sm leading-relaxed text-white/45">
        The container is 300px tall. Drag near the edges to scroll.
      </p>

      <div
        data-testid="scroll-container"
        class="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]"
        style="height: 300px; overflow-y: auto;"
      >
        <Reorder.Group
          v-model:values="items"
          axis="y"
          class="space-y-2 p-4"
        >
          <Reorder.Item
            v-for="item in items"
            :key="item"
            :value="item"
            :data-testid="item.toString()"
            class="bg-white cursor-grab rounded-lg p-4 text-gray-900 shadow-sm active:cursor-grabbing"
            style="list-style: none;"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">Item {{ item }}</span>
              <span class="text-gray-400">↕</span>
            </div>
          </Reorder.Item>
        </Reorder.Group>
      </div>
    </section>

    <section>
      <h2 class="mb-2 text-sm font-medium text-white/70">
        Horizontal
      </h2>
      <p class="mb-3 text-sm leading-relaxed text-white/45">
        The container is 500px wide. Drag near the left or right edge.
      </p>

      <div
        data-testid="horizontal-scroll-container"
        class="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]"
        style="width: 100%; overflow-x: auto;"
      >
        <Reorder.Group
          v-model:values="items2"
          axis="x"
          class="flex p-4"
          style="min-width: max-content;"
        >
          <Reorder.Item
            v-for="item in items2"
            :key="item"
            :value="item"
            :data-testid="`h-${item}`"
            class="mr-2 flex-shrink-0 cursor-grab rounded-lg bg-white p-4 text-gray-900 shadow-sm active:cursor-grabbing"
            style="list-style: none; width: 120px;"
          >
            <div class="flex flex-col items-center gap-2">
              <span class="font-medium">Item {{ item }}</span>
              <span class="text-gray-400">↔</span>
            </div>
          </Reorder.Item>
        </Reorder.Group>
      </div>
    </section>
  </div>
</template>
