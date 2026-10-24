<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'

/**
 * One outer Transition around the whole list, and one per row. The inner
 * presence drives row exits; the outer only tracks its own container leaving.
 */
const open = ref(true)
const rows = ref(['alpha', 'beta'])
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <button
      id="outer-toggle"
      class="btn btn-primary self-start !px-3 !py-1 text-xs"
      @click="open = !open"
    >
      {{ open ? 'Remove outer container' : 'Bring it back' }}
    </button>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="open"
        id="outer-container"
        class="flex flex-col gap-2 rounded-xl border border-violet-300/20 bg-violet-400/[0.06] p-4"
      >
        <AnimatePresence>
          <Motion
            v-for="row in rows"
            :id="`row-${row}`"
            :key="row"
            :initial="{ opacity: 0, x: -12 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 12 }"
            :transition="{ duration: 0.2 }"
            class="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70"
          >
            <span>{{ row }}</span>
            <button
              :id="`drop-${row}`"
              class="font-mono text-[11px] text-white/35 hover:text-white/70"
              @click="rows = rows.filter(r => r !== row)"
            >
              drop
            </button>
          </Motion>
        </AnimatePresence>
      </div>
    </Transition>
  </div>
</template>
