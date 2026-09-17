<script setup lang="ts">
import type { AnimateViewProps } from './types'
import { useAnimateView } from './use-animate-view'

/**
 * Animate enter, exit, update and shared element transitions using the
 * browser's View Transitions API. Adds no wrapper DOM element.
 *
 * State updates must be wrapped in `startTransition`:
 *
 * ```vue
 * <button @click="startTransition(() => show = !show)">Toggle</button>
 * <AnimateView v-if="show"><div class="box" /></AnimateView>
 * ```
 */
defineOptions({
  name: 'AnimateView',
})

const props = defineProps<AnimateViewProps>()

useAnimateView(props)
</script>

<template>
  <slot />
</template>
