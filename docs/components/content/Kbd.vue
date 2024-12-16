<script setup lang="ts">
const { size = 'sm' } = defineProps<{
  size?: 'xs' | 'sm' | 'md'
}>()

const sizeClasses = {
  xs: 'min-h-4 text-[10px] h-4 px-1',
  sm: 'min-h-5 text-[11px] h-5 px-1',
  md: 'min-h-6 text-[12px] h-6 px-1.5',
}
</script>

<template>
  <kbd
    class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted font-sans font-medium"
    :class="sizeClasses[size]"
  >
    <slot />
  </kbd>
</template>
