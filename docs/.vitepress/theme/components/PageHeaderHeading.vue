<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    as="h1"
    :class="cn(
      'text-3xl font-bold leading-tight text-secondary-foreground tracking-tighter md:text-5xl lg:leading-[1.1]',
      $attrs.class ?? '',
    )"
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{
      type: 'spring',
      stiffness: 260,
      damping: 50,
    }"
  >
    <slot />
  </Motion>
</template>
