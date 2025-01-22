<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <Button @click="show = !show">
      {{ show ? 'hide' : 'show' }}
    </Button>
    <div class="h-40 w-40">
      <AnimatePresence>
        <Motion
          v-show="show"
          class="bg-primary  aspect-square rounded-2xl"
          :initial="{ scale: 0 }"
          :animate="{ rotate: 180, scale: 1 }"
          :exit="{ rotate: 0, scale: 0 }"
        />
      </AnimatePresence>
    </div>
  </div>
</template>
