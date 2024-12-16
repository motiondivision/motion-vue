<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'

const count = ref(0)
const items = ref([0])
const popLayout = ref(false)
function removeItem<T>(arr: T[], item: T) {
  const index = arr.indexOf(item)
  if (index > -1)
    arr.splice(index, 1)
}

function addItem() {
  count.value++
  items.value = [...items.value, count.value]
}

function removeItemById(id: any) {
  const newItems = [...items.value]
  removeItem(newItems, id)
  items.value = newItems
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="flex flex-col items-center pb-[50px]">
      <label class="flex items-center my-5">
        <code class="font-mono">popLayout</code>
        <input
          v-model="popLayout"
          type="checkbox"
          class="accent-pink-500"
        >
      </label>
      <Motion
        as="button"
        :initial="{ scale: 1 }"
        :while-tap="{ scale: 0.95 }"
        class="w-[150px] px-6 py-4 text-lg font-bold text-white bg-pink-500 rounded-full cursor-pointer"
        @click="addItem"
      >
        Add item
      </Motion>
    </div>
    <AnimatePresence
      class="flex flex-col w-[300px] h-[300px] gap-5 p-0 list-none"
      :mode="popLayout ? 'popLayout' : 'wait'"
      multiple
      as="ul"
    >
      <!-- :initial="{ scale: 0.8, opacity: 0 }" -->
      <Motion
        v-for="id in items"
        :key="id"
        :data-key="id"
        as="li"
        :animate="{ scale: 1, opacity: 1 }"
        :exit="{
          scale: 0.8,
          opacity: 0,
          transition: {
            duration: 0.5,
          },
        }"
        :transition="{
          type: 'spring',
        }"
        :layout="true"
        class="block h-20 flex-[0_0_80px] bg-pink-500 rounded-[20px] p-0 m-0 list-none"
        @click="removeItemById(id)"
      />
    </AnimatePresence>
  </div>
</template>

<style>
</style>
