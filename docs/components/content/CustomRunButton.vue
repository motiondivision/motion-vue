<script setup lang="ts">
import { useSandpackNavigation } from 'sandpack-vue3'

const { refresh } = useSandpackNavigation()
</script>

<template>
  <UiTooltip>
    <UiTooltipTrigger as-child>
      <UiButton
        variant="ghost"
        size="icon"
        @click="refresh"
      >
        <Icon name="lucide:refresh-cw" />
      </UiButton>
    </UiTooltipTrigger>
    <UiTooltipContent>
      <p>Refresh panel</p>
    </UiTooltipContent>
  </UiTooltip>
</template>

<style scoped>

</style>
