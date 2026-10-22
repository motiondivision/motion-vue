<script setup lang="ts">
import { watch } from 'vue'
import { Motion, usePresence } from 'motion-v'
import StatusPill from './StatusPill.vue'

defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{ dismiss: [] }>()

const [isPresent, safeToRemove] = usePresence()

watch(isPresent, (present) => {
  if (!present)
    setTimeout(() => safeToRemove?.(), 700)
})
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }"
    class="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-4"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-white">
          {{ title }}
        </p>
        <p class="mt-1 text-sm leading-relaxed text-white/50">
          {{ message }}
        </p>
      </div>
      <button
        class="shrink-0 text-xs text-white/40 transition-colors hover:text-white"
        @click="emit('dismiss')"
      >
        Dismiss
      </button>
    </div>

    <StatusPill
      v-if="!isPresent"
      label="waiting for safeToRemove"
      tone="accent"
      class="mt-3"
    />

    <Motion
      :initial="false"
      :animate="{ scaleX: isPresent ? 1 : 0 }"
      :transition="{ duration: 0.7, ease: 'linear' }"
      class="absolute inset-x-0 bottom-0 h-px origin-left bg-violet-300/50"
    />
  </Motion>
</template>
