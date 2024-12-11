<script setup lang="ts">
import WrapBalancer from 'vue-wrap-balancer'
import { cn } from '@/lib/utils'
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    as-child
    :initial="{ opacity: 0, y: 30 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{
      type: 'spring',
      stiffness: 260,
      damping: 50,
      delay: 0.2,
    }"
  >
    <WrapBalancer
      :class="cn('max-w-[750px] block text-lg text-muted-foreground sm:text-xl', $attrs.class ?? '')"
      :prefer-native="false"
      as="p"
    >
      <slot />
    </WrapBalancer>
  </Motion>
</template>
