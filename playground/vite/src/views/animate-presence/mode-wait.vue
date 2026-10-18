<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, LayoutGroup, Motion } from 'motion-v'

const page = ref<'a' | 'b'>('a')
const show = ref(true)
const items = ref([1, 2, 3])

function switchPage() {
  page.value = page.value === 'a' ? 'b' : 'a'
}

function removeFirst() {
  items.value = items.value.slice(1)
}

function resetItems() {
  items.value = [1, 2, 3]
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900">
      AnimatePresence mode=wait + list layout
    </h1>

    <section class="mb-16 flex flex-col items-center gap-6">
      <h2 class="text-2xl font-bold">
        mode="wait" page switch
      </h2>
      <button
        id="switch-page"
        class="btn btn-primary"
        @click="switchPage"
      >
        Switch ({{ page }})
      </button>
      <div
        id="wait-stage"
        class="relative w-full max-w-md h-[160px] border border-dashed border-gray-400"
      >
        <AnimatePresence mode="wait">
          <Motion
            v-if="page === 'a'"
            id="panel-a"
            key="a"
            :initial="{ opacity: 0, x: -40 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 40 }"
            :transition="{ duration: 0.35 }"
            class="absolute inset-4 flex items-center justify-center rounded-xl bg-violet-500 text-white text-2xl font-bold"
          >
            Panel A
          </Motion>
          <Motion
            v-else
            id="panel-b"
            key="b"
            :initial="{ opacity: 0, x: -40 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 40 }"
            :transition="{ duration: 0.35 }"
            class="absolute inset-4 flex items-center justify-center rounded-xl bg-sky-500 text-white text-2xl font-bold"
          >
            Panel B
          </Motion>
        </AnimatePresence>
      </div>
    </section>

    <section class="mb-16 flex flex-col items-center gap-6">
      <h2 class="text-2xl font-bold">
        Interrupt / re-enter mid-exit
      </h2>
      <button
        id="toggle-show"
        class="btn btn-primary"
        @click="show = !show"
      >
        {{ show ? 'Hide' : 'Show' }}
      </button>
      <div
        id="interrupt-stage"
        class="relative w-full max-w-md h-[120px]"
      >
        <AnimatePresence>
          <Motion
            v-if="show"
            id="interrupt-item"
            key="interrupt"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.6 }"
            class="absolute inset-4 flex items-center justify-center rounded-xl bg-emerald-500 text-white text-xl font-bold"
          >
            Interruptible
          </Motion>
        </AnimatePresence>
      </div>
    </section>

    <section class="flex flex-col items-center gap-6">
      <h2 class="text-2xl font-bold">
        List remove with layout siblings
      </h2>
      <div class="flex gap-3">
        <button
          id="remove-first"
          class="btn btn-primary"
          @click="removeFirst"
        >
          Remove first
        </button>
        <button
          id="reset-items"
          class="btn"
          @click="resetItems"
        >
          Reset
        </button>
      </div>
      <LayoutGroup>
        <ul
          id="layout-list"
          class="flex flex-col gap-3 w-[280px] list-none p-0 m-0"
        >
          <AnimatePresence>
            <Motion
              v-for="id in items"
              :id="`list-item-${id}`"
              :key="id"
              layout
              as="li"
              :initial="{ opacity: 0, scale: 0.9 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.8 }"
              :transition="{ duration: 0.45 }"
              class="h-16 rounded-2xl bg-pink-500 text-white font-bold flex items-center justify-center"
            >
              {{ id }}
            </Motion>
          </AnimatePresence>
        </ul>
      </LayoutGroup>
    </section>
  </div>
</template>
