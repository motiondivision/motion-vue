<script setup lang="ts">
withDefaults(defineProps<{
  minHeight?: string
  align?: 'center' | 'start'
}>(), {
  minHeight: '260px',
  align: 'center',
})
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(123,47,247,0.10),transparent_70%)]" />
    <div
      class="relative flex p-6"
      :class="align === 'center' ? 'items-center justify-center' : 'items-start justify-start'"
      :style="{ minHeight }"
    >
      <slot />
    </div>
  </div>
</template>
