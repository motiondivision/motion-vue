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
  tabs.value = [...removeItem(tabs.value, item)]
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
  <div class="mx-auto w-[480px] h-[360px] rounded-lg bg-white overflow-hidden shadow-[0_1px_1px_hsl(0deg_0%_0%_/_0.075),0_2px_2px_hsl(0deg_0%_0%_/_0.075),0_4px_4px_hsl(0deg_0%_0%_/_0.075),0_8px_8px_hsl(0deg_0%_0%_/_0.075),0_16px_16px_hsl(0deg_0%_0%_/_0.075)] flex flex-col">
    <LayoutGroup>
      <nav>
        <ReorderGroup
          v-model:values="tabs"
          tag="ul"
          axis="x"
          class="tabs"
        >
          <AnimatePresence
            multiple
            :initial="false"
          >
            <Tab
              v-for="item in tabs"
              :key="item.label"
              :item="item"
              :data-size="tabs.length"
              :is-selected="selectedTab === item"
              @click="selectedTab = item"
              @remove="remove(item)"
            />
          </AnimatePresence>
        </ReorderGroup>
        <motion.button
          class="add-item flex items-center justify-center"
          :disabled="tabs.length === allIngredients.length"
          :initial="{ scale: 1 }"
          :press="{ scale: 0.9 }"
          @click="add"
        >
          <AddIcon />
        </motion.button>
      </nav>
    </LayoutGroup>
    <main>
      <AnimatePresence
        mode="wait"
        :initial="false"
      >
        <motion.div
          :key="selectedTab ? selectedTab.label : 'empty'"
          :initial="{ opacity: 1, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -20 }"
          :transition="{ duration: 0.15 }"
        >
          {{ selectedTab ? selectedTab.icon : '😋' }}
        </motion.div>
      </AnimatePresence>
    </main>
  </div>
</template>

<style scoped>
nav {
  background: #fdfdfd;
  padding: 5px 5px 0;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 1px solid #eeeeee;
  height: 44px;
  display: grid;
  grid-template-columns: 1fr 35px;
  max-width: 480px;
  overflow: hidden;
}

.tabs {
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: nowrap;
  width: 420px;
  padding-right: 10px;
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 128px;
  flex-grow: 1;
  user-select: none;
}

:deep(ul),
:deep(li) {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  font-size: 14px;
}

:deep(li) {
  border-radius: 5px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  width: 100%;
  padding: 10px 15px;
  position: relative;
  background: white;
  cursor: pointer;
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
  user-select: none;
}

:deep(li span) {
  flex-shrink: 1;
  flex-grow: 1;
  line-height: 18px;
  white-space: nowrap;
  display: block;
  min-width: 0;
  padding-right: 30px;
  mask-image: linear-gradient(to left, transparent 20px, #fff 40px);
  -webkit-mask-image: linear-gradient(to left, transparent 20px, #fff 40px);
}

:deep(li .close) {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

:deep(li button) {
  width: 20px;
  height: 20px;
  border: 0;
  background: #fff;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  stroke: #000;
  margin-left: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background: #fff;
}

.add-item {
  width: 30px;
  height: 30px;
  background: #eee;
  border-radius: 50%;
  border: 0;
  cursor: pointer;
  align-self: center;
}

.add-item:disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}
</style>
