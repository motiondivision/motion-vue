<script setup lang="ts">
import { Motion, injectLayoutGroup } from 'motion-v'

const props = defineProps<{
  content: string
  layout?: boolean
}>()
const isOpen = ref(false)
const layoutGroup = injectLayoutGroup({} as any)
function handleClick() {
  isOpen.value = !isOpen.value
  layoutGroup?.forceRender?.()
}
onUpdated(() => {
  console.log('onUpdated', layoutGroup)
})
</script>

<template>
  <Motion
    class="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
    :layout="true"
    @click="handleClick"
  >
    <Motion
      as="header"
      class="text-lg font-semibold"
      :layout="true"
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
