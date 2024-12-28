<script setup lang="ts">
import { onBeforeUpdate } from 'vue'
import { type LayoutGroupProps, useLayoutGroupProvider } from './use-layout-group'

const props = defineProps<LayoutGroupProps>()
const { forceRender, key, group } = useLayoutGroupProvider(props)

onBeforeUpdate(() => {
  group.dirty()
})
</script>

<template>
  <slot
    :render-key="key"
    :force-render="forceRender"
  />
</template>
