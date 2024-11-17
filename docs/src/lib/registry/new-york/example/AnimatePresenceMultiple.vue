<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <div class="flex ">
    <button @click="show = !show">
      {{ show ? 'hide' : 'show' }}
    </button>
    <div class="w-1/3 flex h-20 gap-4">
      <AnimatePresence multiple>
        <Motion
          v-show="show"
          key="1"
          class="bg-primary  aspect-square rounded-2xl flex-1"
          :initial="{ scale: 0 }"
          :animate="{ rotate: 180, scale: 1 }"
          :exit="{ rotate: 0, scale: 0 }"
          :transition="{
            // type: 'spring',
            // stiffness: 260,
            // damping: 20,
            duration: 3,
          }"
        />
        <Motion
          v-if="show"
          key="2"
          class="bg-primary  aspect-square rounded-2xl flex-1"
          :initial="{ scale: 0 }"
          :animate="{ rotate: 180, scale: 1 }"
          :exit="{ rotate: 0, scale: 0 }"
          :transition="{
            // type: 'spring',
            // stiffness: 260,
            // damping: 20,
            duration: 3,
          }"
        />
      </AnimatePresence>
    </div>
  </div>
</template>
