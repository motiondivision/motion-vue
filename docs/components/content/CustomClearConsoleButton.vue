<script setup lang="ts">
import { useSandpackConsole } from 'sandpack-vue3'

const { reset, logs } = useSandpackConsole({
  resetOnPreviewRestart: true,
})
function clear() {
  logs.value = []
  reset()
}
</script>

<template>
  <UiTooltip>
    <UiTooltipTrigger as-child>
      <UiButton
        variant="ghost"
        size="icon"
        @click="clear"
      >
        <Icon name="lucide:circle-x" />
      </UiButton>
    </UiTooltipTrigger>
    <UiTooltipContent>
      <p>Clear console</p>
    </UiTooltipContent>
  </UiTooltip>
</template>

<style scoped>

</style>
