<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const { link } = defineProps<{
  link: NavItem
}>()
</script>

<template>
  <Icon
    v-if="link.icon"
    :name="link.icon"
    class="min-w-4"
  />

  <span :class="{ 'truncate text-nowrap': link.navTruncate }">
    {{ link.title }}
  </span>

  <span
    v-for="(badge, i) in link.navBadges"
    :key="i"
  >
    <Badge
      :variant="badge.variant"
      :type="badge.type"
      :size="badge.size ?? 'sm'"
    >
      {{ badge.value }}
    </Badge>
  </span>
</template>
