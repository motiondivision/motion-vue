<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const { link, level } = defineProps<{
  link: NavItem
  level: number
}>()

const { collapse, collapseLevel, folderStyle: defaultFolderStyle } = useConfig().value.aside

const collapsed = useCollapsedMap()
const isOpen = ref(collapsed.value.get(link._path) || defaultOpen())

function defaultOpen() {
  if (link.collapse !== undefined)
    return !link.collapse

  return level < collapseLevel && !collapse
}

watch(isOpen, (v) => {
  collapsed.value.set(link._path, v)
})
const isActive = computed(() => link._path === useRoute().path)

const folderStyle = computed(() => link.sidebar?.style ?? defaultFolderStyle)
</script>

<template>
  <li>
    <!-- Folder -->
    <div v-if="link.children">
      <template v-if="folderStyle === 'group'">
        <div
          class="mt-2 flex items-center gap-2 rounded-md px-2 text-xs font-semibold text-foreground/70 outline-none"
          :class="[link.navTruncate !== false && 'h-8']"
        >
          <LayoutAsideTreeItemButton :link />
        </div>
        <LayoutAsideTree
          :links="link.children"
          :level="level"
        />
      </template>
      <template v-else>
        <button
          class="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-left text-sm font-medium text-foreground/80 hover:bg-muted hover:text-primary"
          :class="[link.navTruncate !== false && 'h-8']"
          @click="isOpen = !isOpen"
        >
          <Icon
            v-if="folderStyle === 'tree'"
            name="lucide:chevron-down"
            class="transition-transform"
            :class="[!isOpen && '-rotate-90']"
          />
          <LayoutAsideTreeItemButton :link />
          <Icon
            v-if="folderStyle === 'default'"
            name="lucide:chevron-down"
            class="ml-auto transition-transform"
            :class="[!isOpen && '-rotate-90']"
          />
        </button>
        <div v-show="isOpen">
          <LayoutAsideTree
            :links="link.children"
            :level="level + 1"
          />
        </div>
      </template>
    </div>
    <!-- Page -->
    <NuxtLink
      v-else
      :to="link._path"
      class="flex items-center gap-2 rounded-md p-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
      :class="[
        isActive && 'bg-muted !text-primary',
        link.navTruncate !== false && 'h-8',
      ]"
    >
      <LayoutAsideTreeItemButton :link />
    </NuxtLink>
  </li>
</template>
