<script setup lang="ts">
const {
  href = '',
  external = false,
  target,
} = defineProps<{
  href?: string
  target?: Target
  external?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="href"
    :target="target"
    :external="external"
    class="font-semibold underline underline-offset-4"
  >
    <slot />
  </NuxtLink>
</template>
