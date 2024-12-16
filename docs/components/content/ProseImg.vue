<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
})

const refinedSrc = computed(() => {
  if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
    if (_base !== '/' && !props.src.startsWith(_base))
      return joinURL(_base, props.src)
  }
  return props.src
})
</script>

<template>
  <NuxtImg
    :src="refinedSrc"
    :alt
    :width
    :height
    class="rounded-md [&:not(:first-child)]:mt-8 [&:not(:last-child)]:mb-8"
  />
</template>
