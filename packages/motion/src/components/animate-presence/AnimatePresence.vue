<script setup lang="ts">
import { Transition, TransitionGroup, computed } from 'vue'
import type { AnimatePresenceProps } from './types'
import { usePresenceContainer } from './use-presence-container'

defineOptions({
  name: 'AnimatePresence',
  inheritAttrs: true,
})

const props = withDefaults(defineProps<AnimatePresenceProps>(), {
  mode: 'sync',
  initial: true,
  anchorX: 'left',
})

const { beforeEnter, enter, exit } = usePresenceContainer(props)

const transitionProps = computed(() => {
  if (props.mode !== 'wait') {
    return {
      tag: props.as,
    }
  }
  return {
    mode: props.mode === 'wait' ? 'out-in' : undefined,
  }
})
</script>

<template>
  <!-- @vue-ignore -->
  <component
    :is="mode === 'wait' ? Transition : TransitionGroup"
    v-bind="transitionProps"
    appear
    @leave="exit"
    @enter="enter"
    @before-enter="beforeEnter"
  >
    <slot />
  </component>
</template>
