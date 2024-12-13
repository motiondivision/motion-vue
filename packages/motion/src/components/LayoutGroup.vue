<script setup lang="ts">
import { type LayoutGroupProps, useLayoutGroup } from './use-layout-group'

const props = defineProps<LayoutGroupProps>()
useLayoutGroup(props)
</script>

<template>
  <slot />
</template>
