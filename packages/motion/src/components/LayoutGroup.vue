<script setup lang="ts">
import { type LayoutGroupProps, useLayoutGroupProvider } from './use-layout-group'

const props = defineProps<LayoutGroupProps>()
const { forceRender, key } = useLayoutGroupProvider(props)
</script>

<template>
  <slot
    :render-key="key"
    :force-render="forceRender"
  />
</template>
