<script setup lang="ts">
const { icon, to, target } = defineProps<{
  icon?: string
  to?: string
  target?: Target
}>()
</script>

<template>
  <Alert
    :icon
    :to
    :target
  >
    <slot />
  </Alert>
</template>
