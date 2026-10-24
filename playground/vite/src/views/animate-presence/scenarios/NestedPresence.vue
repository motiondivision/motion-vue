<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'

const open = ref(true)
const swatches = ['mint', 'amber', 'violet']
const active = ref(swatches[0])
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <div class="flex gap-2">
      <button
        v-for="swatch in swatches"
        :id="`swatch-${swatch}`"
        :key="swatch"
        class="btn btn-outline flex-1 !px-2 !py-1 text-xs capitalize"
        @click="active = swatch"
      >
        {{ swatch }}
      </button>
      <button
        id="nested-inner-toggle"
        class="btn btn-primary flex-1 !px-2 !py-1 text-xs"
        @click="open = !open"
      >
        {{ open ? 'Close' : 'Open' }}
      </button>
    </div>

    <AnimatePresence>
      <Motion
        v-if="open"
        id="nested-inner-card"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.94 }"
        :transition="{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }"
        class="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4"
      >
        <!-- Swapping this key exits the old swatch while the outer card stays. -->
        <AnimatePresence mode="wait">
          <Motion
            :id="`swatch-card-${active}`"
            :key="active"
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -8 }"
            :transition="{ duration: 0.2 }"
            class="text-sm capitalize text-white/75"
          >
            {{ active }}
          </Motion>
        </AnimatePresence>
      </Motion>
    </AnimatePresence>
  </div>
</template>
