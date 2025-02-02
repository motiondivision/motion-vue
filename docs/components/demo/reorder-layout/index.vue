<script setup lang="ts">
import { ref } from 'vue'
import Tab from './Tab.vue'
import AddIcon from './AddIcon.vue'
import {
  type Ingredient,
  allIngredients,
  getNextIngredient,
  initialTabs,
} from './ingredients'
import { closestItem, removeItem } from './array-utils'
import { AnimatePresence, ReorderGroup, motion } from 'motion-v'

const tabs = ref(initialTabs)
const selectedTab = ref(tabs.value[0])

function remove(item: Ingredient) {
  if (item === selectedTab.value) {
    selectedTab.value = closestItem(tabs.value, item)
  }
  tabs.value = removeItem(tabs.value, item)
}

function add() {
  const nextItem = getNextIngredient(tabs.value)
  if (nextItem) {
    tabs.value = [...tabs.value, nextItem]
    selectedTab.value = nextItem
  }
}
</script>

<template>
  <div class="w-full h-full">
    <nav
      style="grid-template-columns: 1fr 35px;"
      class="bg-background w-full px-1 pt-1 rounded-xl h-11 grid overflow-hidden "
    >
      <ReorderGroup
        :values="tabs"
        tag="ul"
        axis="x"
        class="grow flex justify-start items-end flex-nowrap w-full pr-2.5"
        @reorder="tabs = $event"
      >
        <AnimatePresence multiple>
          <Tab
            v-for="item in tabs"
            :key="item.label"
            :item="item"
            :is-selected="selectedTab === item"
            @click="selectedTab = item"
            @remove="remove(item)"
          />
        </AnimatePresence>
      </ReorderGroup>
      <motion.button
        class="add-item"
        :disabled="tabs.length === allIngredients.length"
        :initial="{ scale: 1 }"
        :press="{ scale: 0.9 }"
        @click="add"
      >
        <AddIcon />
      </motion.button>
    </nav>
    <main>
      <motion.div
        :key="selectedTab ? selectedTab.label : 'empty'"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -20 }"
        :transition="{ duration: 150 }"
      >
        {{ selectedTab ? selectedTab.icon : '😋' }}
      </motion.div>
    </main>
  </div>
</template>
