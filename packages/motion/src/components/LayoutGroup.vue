<script setup lang="ts">
import { type LayoutGroupProps, useLayoutGroupProvider } from './use-layout-group'

const props = withDefaults(defineProps<LayoutGroupProps>(), {
  inherit: true,
})
const { forceRender, key } = useLayoutGroupProvider(props)
</script>

<template>
  <slot
    :render-key="key"
    :force-render="forceRender"
  />
</template>
