<script setup lang="ts">
import WrapBalancer from 'vue-wrap-balancer'
import { cn } from '@/lib/utils'
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    as-child
  >
    <WrapBalancer
      :class="cn('max-w-[750px] text-lg text-muted-foreground sm:text-xl', $attrs.class ?? '')"
      :prefer-native="false"
    >
      <slot />
    </WrapBalancer>
  </Motion>
</template>
