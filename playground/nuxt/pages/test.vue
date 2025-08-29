<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

// Tab data
const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
]

// Current active tab
const activeTab = ref(tabs[0].id)
// Hovered tab
const hoveredTab = ref<string | null>(null)

function setActiveTab(tabId: string) {
  activeTab.value = tabId
}

function setHoveredTab(tabId: string | null) {
  hoveredTab.value = tabId
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-8">
    <div class="w-full max-w-md">
      <!-- Tab Navigation -->
      <div class="relative p-1 bg-muted rounded-lg">
        <!-- Active Tab Background -->

        <!-- Tab List -->
        <div
          class="relative flex"
          @mouseleave="setHoveredTab(null)"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="relative px-3 py-1.5 text-sm font-medium transition-colors z-10 flex-1"
            :class="[
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @mouseenter="setHoveredTab(tab.id)"
          >
            {{ tab.label }}
            <AnimatePresence mode="sync">
              <Motion
                v-if="hoveredTab === tab.id"
                :data-id="tab.id"
                class="absolute bg-background bg-blue-500 z-[-1] w-full h-full top-0 left-0 rounded-md shadow-sm border"
                layout-id="hover-tab"
                :initial="{
                  opacity: 0,
                }"
                :animate="{
                  opacity: 1,
                }"
                :exit="{
                  opacity: 0,
                }"
                :transition="{
                  layout: {
                    type: 'spring',
                    stiffness: 250,
                    damping: 27,
                    mass: 1,
                  },
                }"
                :style="{
                  position: 'absolute',
                  top: -1,
                  left: 0,
                  width: '100%',
                  height: '26px',
                  zIndex: 0,
                }"
              />
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
