<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links, level } = defineProps<{
  links: TocLink[]
  level: number
}>()

const { activeHeadings, updateHeadings } = useScrollspy()

onMounted(() =>
  updateHeadings([
    ...document.querySelectorAll('.docs-content h1'),
    ...document.querySelectorAll('.docs-content h2'),
    ...document.querySelectorAll('.docs-content h3'),
    ...document.querySelectorAll('.docs-content h4'),
  ]),
)
</script>

<template>
  <ul :class="[level !== 0 && 'pl-4']">
    <li
      v-for="link in links"
      :key="link.id"
      class="pt-2"
    >
      <NuxtLink
        :to="`#${link.id}`"
        class="text-muted-foreground transition-all hover:text-primary"
        :class="[activeHeadings.includes(link.id) && 'text-primary']"
      >
        {{ link.text }}
      </NuxtLink>
      <TocTree
        v-if="link.children"
        :links="(link.children || []).filter((x: any) => x.id !== 'hide-toc')"
        :level="level + 1"
      />
    </li>
  </ul>
</template>
