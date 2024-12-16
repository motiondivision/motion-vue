<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Primitive, type PrimitiveProps } from 'radix-vue'
import { type ButtonVariants, buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :data-icon-only="size === 'icon' ? true : undefined"
  >
    <slot />
  </Primitive>
</template>

<style scoped>
[data-icon-only]::before {
  z-index: 0;
  position: absolute;
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  transition: opacity 0.3s, box-shadow 0.3s, border-color 0.2s, background 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: transparent;
  transform: scale(1) translateZ(0);
  border: 2px solid transparent;
  box-shadow: none;
  opacity: 0;
}

[data-icon-only]:hover::before {
  transform: scale(0.92) translateZ(0);
  border: 2px solid hsl(var(--primary));
  opacity: 1;
}
</style>
