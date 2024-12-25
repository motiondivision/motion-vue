<script setup lang="ts">
import { onBeforeUpdate, onUpdated } from 'vue'
import { type LayoutGroupProps, useLayoutGroupProvider } from './use-layout-group'

const props = defineProps<LayoutGroupProps>()
const { forceRender, key, group } = useLayoutGroupProvider(props)
onUpdated(() => {
})
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
