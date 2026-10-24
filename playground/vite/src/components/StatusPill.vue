<script setup lang="ts">
defineProps<{
  label: string
  tone?: 'idle' | 'accent'
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px]"
    :class="tone === 'accent'
      ? 'border-violet-300/25 bg-violet-400/10 text-violet-200'
      : 'border-white/10 bg-white/[0.04] text-white/45'"
  >
    {{ label }}
  </span>
</template>
