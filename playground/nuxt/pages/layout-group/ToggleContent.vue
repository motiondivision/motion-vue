<script setup lang="ts">
import { Motion, injectLayoutGroup } from 'motion-v'

const props = defineProps<{
  content: string
  layout?: boolean
}>()
const isOpen = ref(false)
const layoutGroup = injectLayoutGroup({})
function handleClick() {
  isOpen.value = !isOpen.value
  layoutGroup?.forceRender?.()
}
</script>

<template>
  <Motion
    class="bg-gray-100 p-4  cursor-pointer hover:bg-gray-200 transition-colors"
    :layout="true"
    :initial="{ borderRadius: '8px' }"
    @click="handleClick"
  >
    <Motion
      as="header"
      class="text-lg font-semibold"
      :layout="true"
      :data-a="isOpen"
    >
      {{ isOpen ? 'close' : 'open' }}
    </Motion>
    <Motion
      v-if="isOpen"
      :layout="true"
      class="mt-4 text-gray-600"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ delay: 0.2 }"
    >
      {{ props.content }}
    </Motion>
  </Motion>
</template>
