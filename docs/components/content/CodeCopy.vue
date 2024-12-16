<script setup lang="ts">
import { onClickOutside, useClipboard } from '@vueuse/core'

const { code } = defineProps<{
  code: string
}>()

const { copy } = useClipboard({ source: code })
const copied = ref(false)

async function handleClick() {
  await copy(code)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const checkIconRef = ref<HTMLElement>()
onClickOutside(checkIconRef, () => {
  copied.value = false
})
</script>

<template>
  <div class="flex">
    <AnimatePresence mode="wait">
      <Motion
        v-if="copied === false"
        :initial="{ opacity: 0.35, scale: 0.5 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.5 }"
        as-child
      >
        <Icon
          name="lucide:copy"

          class="block cursor-pointer self-center text-muted-foreground hover:text-primary"
          @click="handleClick"
        />
      </Motion>
      <Motion
        v-else
        :initial="{ opacity: 0.35, scale: 0.5 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.5 }"
        as-child
      >
        <Icon
          ref="checkIconRef"
          name="lucide:check"
          class="block cursor-pointer self-center text-muted-foreground hover:text-primary"
        />
      </Motion>
    </AnimatePresence>
  </div>
</template>
