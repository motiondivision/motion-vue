<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    as="h1"
    :class="cn(
      'text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]',
      $attrs.class ?? '',
    )"
  >
    <slot />
  </Motion>
</template>
