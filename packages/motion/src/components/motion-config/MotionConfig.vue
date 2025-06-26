<script setup lang="ts">
import { computed } from 'vue'
import type { MotionConfigProps } from './types'
import { defaultConfig, provideMotionConfig, useMotionConfig } from './context'
import { isDef } from '@vueuse/core'
import { warning } from 'hey-listen'

defineOptions({
  name: 'MotionConfig',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MotionConfigProps & { reducedMotion?: 'user' | 'never' | 'always' }>(), {
  reducedMotion: ({ reduceMotion }) => {
    if (isDef(reduceMotion)) {
      warning(false, '`reduceMotion` is deprecated. Use `reducedMotion` instead.')
      return reduceMotion
    }
    return defaultConfig.reducedMotion
  },
})

const parentConfig = useMotionConfig()
const config = computed(() => ({
  transition: props.transition ?? parentConfig.value.transition,
  reducedMotion: props.reducedMotion ?? parentConfig.value.reducedMotion,
  nonce: props.nonce ?? parentConfig.value.nonce,
  inViewOptions: props.inViewOptions ?? parentConfig.value.inViewOptions,
}))

provideMotionConfig(config)
</script>

<template>
  <slot />
</template>
