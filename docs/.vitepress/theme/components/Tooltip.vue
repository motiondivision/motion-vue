<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/lib/registry/new-york/ui/tooltip'

defineProps<{
  content: string
}>()
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipContent>
        {{ content }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
