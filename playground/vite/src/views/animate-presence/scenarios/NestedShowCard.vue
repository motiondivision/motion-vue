<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const visible = ref(true)
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <!-- The toggle lives outside the v-show element: hiding it must not take
         away the only control that brings it back. -->
    <button
      id="nested-v-show-toggle"
      class="btn btn-outline self-start !px-3 !py-1 text-xs"
      @click="visible = !visible"
    >
      {{ visible ? 'Hide inner' : 'Show inner' }}
    </button>

    <Motion
      v-show="visible"
      id="nested-v-show"
      :animate="{ opacity: 1, x: 0 }"
      :exit="{ opacity: 0, x: 24 }"
      :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
      class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4"
    >
      <span class="text-sm text-white/75">Inner v-show</span>
      <span class="font-mono text-[11px] text-white/30">stays mounted</span>
    </Motion>
  </div>
</template>
