<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const props = defineProps<{
  links: NavItem[]
  level: number
}>()
</script>

<template>
  <ul
    class="flex flex-col gap-1 py-1"
    :class="[props.level > 0 && 'mx-3.5 border-l px-2.5']"
  >
    <template
      v-for="link in props.links"
      :key="link._id"
    >
      <LayoutAsideTreeItem
        :link="link"
        :level="props.level"
      />
    </template>
  </ul>
</template>
