<script setup lang="ts">
import { computed } from 'vue'
import type { MotionConfigProps } from './types'
import { defaultConfig, provideMotionConfig, useMotionConfig } from './context'

defineOptions({
  name: 'MotionConfig',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MotionConfigProps>(), {
  reduceMotion: defaultConfig.reduceMotion,
})

const parentConfig = useMotionConfig()
const config = computed(() => ({
  transition: props.transition ?? parentConfig.value.transition,
  reduceMotion: props.reduceMotion ?? parentConfig.value.reduceMotion,
  nonce: props.nonce ?? parentConfig.value.nonce,
  inViewOptions: props.inViewOptions ?? parentConfig.value.inViewOptions,
}))

provideMotionConfig(config)
</script>

<template>
  <slot />
</template>
