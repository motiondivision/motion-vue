<script setup lang="ts">
import type { ButtonVariants } from '../ui/button'

const { to, href, target, blank, variant, size, leftIcon, rightIcon } = defineProps<{
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  leftIcon?: string
  rightIcon?: string
  to?: string
  href?: string
  target?: Target
  blank?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="to || href"
    :target="(blank && '_blank') || target"
  >
    <UiButton
      :variant
      :size
    >
      <SmartIcon
        v-if="leftIcon"
        :name="leftIcon"
        class="mr-1"
      />
      <ContentSlot unwrap="p" />
      <SmartIcon
        v-if="rightIcon"
        :name="rightIcon"
        class="ml-1"
      />
    </UiButton>
  </NuxtLink>
</template>
