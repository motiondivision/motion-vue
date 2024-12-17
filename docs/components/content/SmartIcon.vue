<script setup lang="ts">
import { stringToIcon, validateIconName } from '@iconify/utils'

const { size = 16, name } = defineProps<{
  name: string
  size?: number
}>()

function checkIcon(name: string): boolean {
  return validateIconName(stringToIcon(name))
}
</script>

<template>
  <!-- Iconify Icons -->
  <Icon
    v-if="checkIcon(name)"
    :name
    :size
  />
  <!-- Emojis -->
  <span
    v-else-if="/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(name)"
    :style="`font-size: ${size}px;`"
  >{{ name }}</span>
  <!-- Link -->
  <NuxtImg
    v-else
    :src="name"
    :style="`width: ${size}px; height: ${size}px;`"
    class="inline"
  />
</template>
