<script setup>
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

const ITEMS = [
  {
    title: 'Item One',
    longDescription: 'This is the detailed description for item one.',
  },
  {
    title: 'Item Two',
    longDescription: 'This is the detailed description for item two.',
  },
  {
    title: 'Item Three',
    longDescription: 'This is the detailed description for item three.',
  },
]

const activeItem = ref(null)
const activeItemRef = ref(null)
const useAnimatePresence = ref(false)

onClickOutside(activeItemRef, () => {
  activeItem.value = null
})

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  activeItem.value = null
})

function setActiveItem(item) {
  activeItem.value = item
}
</script>

<template>
  <div class="wrapper">
    <!-- For Demonstration Purposes -->
    <div class="controls">
      <label class="checkbox">
        <input
          v-model="useAnimatePresence"
          type="checkbox"
        >
        AnimatePresence on overlay
      </label>
      <p class="hint">
        {{
          useAnimatePresence
            ? "⚠️ Now the shared layout transitions for the cards are broken"
            : "⚠️ Now there is no exit animation on the overlay"
        }}
      </p>
    </div>

    <!-- With AnimatePresence -->
    <AnimatePresence v-if="useAnimatePresence">
      <!-- <motion.div
        v-if="activeItem"
        class="overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      /> -->
      <!-- <div /> -->
    </AnimatePresence>

    <!-- Without AnimatePresence -->
    <motion.div
      v-else-if="activeItem"
      class="overlay"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
    />

    <AnimatePresence>
      <div
        v-if="activeItem"
        class="active-item"
      >
        <motion.div
          ref="activeItemRef"
          :layout-id="`card-${activeItem.title}`"
          class="inner"
        >
          <div class="header">
            <motion.img
              height="56"
              width="56"
              src="https://picsum.photos/56/56"
              :layout-id="`image-${activeItem.title}`"
            />
            <motion.h2 :layout-id="`title-${activeItem.title}`">
              {{ activeItem.title }}
            </motion.h2>
          </div>
          <motion.p
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            class="long-description"
          >
            {{ activeItem.longDescription }}
          </motion.p>
        </motion.div>
      </div>
    </AnimatePresence>

    <ul class="list">
      <motion.li
        v-for="item in ITEMS"
        :key="item.title"
        :layout-id="`card-${item.title}`"
        @click="setActiveItem(item)"
      >
        <motion.img
          height="56"
          width="56"
          src="https://picsum.photos/56/56"
          :layout-id="`image-${item.title}`"
        />
        <motion.h2 :layout-id="`title-${item.title}`">
          {{ item.title }}
        </motion.h2>
      </motion.li>
    </ul>
  </div>
</template>

  <style scoped>
  .wrapper {
    display: grid;
    place-items: center;
    height: 100vh
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
  }

  .list li {
    display: flex;
    cursor: pointer;
    align-items: center;
    gap: 16px;
    padding: 8px;
    background: white;
  }

  .active-item {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 10;
  }

  .active-item .inner {
    display: flex;
    width: 400px;
    flex-direction: column;
    gap: 16px;
    background: white;
    padding: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .long-description {
    font-size: 14px;
    color: #63635d;
  }

  .overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
  }

  .controls {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
  }

  .hint {
    font-size: 13px;
    color: #b45309;
  }
  </style>

  <style>
  * {
    box-sizing: border-box;
    margin: 0;
  }

  body,
  html,
  #app {
    height: 100%;
  }

  body {
    font-family: system-ui, sans-serif;
  }
  </style>
