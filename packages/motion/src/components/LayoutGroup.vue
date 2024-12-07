<script setup lang="ts">
import { watch } from 'vue'
import type { InheritOption, LayoutGroupState } from './context'
import { injectLayoutGroup, provideLayoutGroup, shouldInheritGroup, shouldInheritId } from './context'
import { nodeGroup } from './group'
import { useForceUpdate } from './use-force-update'

export interface LayoutGroupProps {
  id?: string
  inherit?: InheritOption
}

const props = defineProps<LayoutGroupProps>()
const layoutGroup = injectLayoutGroup(null)
const [forceRender, key] = useForceUpdate()

function generateId() {
  const upstreamId = layoutGroup?.id
  return (shouldInheritId(props.inherit) && upstreamId) ? (props.id ? `${upstreamId}-${props.id}` : upstreamId) : props.id
}
function generateGroup() {
  return shouldInheritGroup(props.inherit)
    ? layoutGroup?.group || nodeGroup()
    : nodeGroup()
}
const memoizedContext: LayoutGroupState = {
  id: generateId(),
  group: generateGroup(),
  forceRender,
  key,
}
watch(key, () => {
  memoizedContext.id = generateId()
})
provideLayoutGroup(memoizedContext)
</script>

<template>
  <slot />
</template>
