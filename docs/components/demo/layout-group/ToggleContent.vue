<script setup lang="ts">
import { Motion } from 'motion-v'

const props = defineProps<{
  content: string
  layout?: boolean
}>()
const isOpen = ref(false)
function handleClick() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <Motion
    class="bg-secondary p-4  cursor-pointer  transition-colors"
    :layout="true"
    :initial="{ borderRadius: '8px' }"
    @click="handleClick"
  >
    <Motion
      as="header"
      class="text-lg  text-primary font-semibold"
      :layout="true"
      :data-a="isOpen"
    >
      {{ isOpen ? 'close' : 'open' }}
    </Motion>
    <Motion
      v-if="isOpen"
      :layout="true"
      class="mt-4 text-secondary-foreground"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ delay: 0.2 }"
    >
      {{ props.content }}
    </Motion>
  </Motion>
</template>
