<script setup lang="ts">
import { UnstyledOpenInCodeSandboxButton } from 'sandpack-vue3'
</script>

<template>
  <UnstyledOpenInCodeSandboxButton>
    <UiTooltip>
      <UiTooltipTrigger>
        <UiButton
          size="icon"
          variant="ghost"
          class="flex items-center justify-center"
        >
          <Icon name="lucide:codesandbox" />
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>Open in CodeSandbox</p>
      </UiTooltipContent>
    </UiTooltip>
  </UnstyledOpenInCodeSandboxButton>
</template>
