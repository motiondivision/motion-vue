<script setup lang="ts">
import { watch } from 'vue'
import { type LayoutGroupProps, useLayoutGroupProvider } from './use-layout-group'

const props = defineProps<LayoutGroupProps>()
const { forceRender, key, group } = useLayoutGroupProvider(props)

watch(key, () => {
  group.dirty()
})
</script>

<template>
  <slot
    :render-key="key"
    :force-render="forceRender"
  />
</template>
