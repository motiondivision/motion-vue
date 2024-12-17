<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <button @click="show = !show">
      {{ show ? 'hide' : 'show' }}
    </button>
    <AnimatePresence
      multiple
      as="div"
      class="flex gap-4 w-40"
    >
      <Motion
        v-show="show"
        key="1"
        class="bg-primary w-1/3  aspect-square rounded-2xl flex-1"
        :initial="{ scale: 0 }"
        :animate="{ rotate: 180, scale: 1 }"
        :exit="{ rotate: 0, scale: 0 }"
      />
      <Motion
        v-if="show"
        key="2"
        class="bg-primary  aspect-square rounded-2xl flex-1"
        :initial="{ scale: 0 }"
        :animate="{ rotate: 180, scale: 1 }"
        :exit="{ rotate: 0, scale: 0 }"
      />
    </AnimatePresence>
  </div>
</template>
