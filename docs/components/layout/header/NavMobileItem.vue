<script setup lang="ts">
import { useCollapsedMap } from '~/composables/useCollapsedMap'

const props = defineProps<{
  item: any
  index: number
}>()

const collapsed = useCollapsedMap()
const isOpen = ref(collapsed.value.get(`mobile-header-nav${props.index}`) || false)
watch(isOpen, (v) => {
  collapsed.value.set(`mobile-header-nav${props.index}`, v)
})
</script>

<template>
  <template v-if="props.item.links">
    <UiCollapsible v-model:open="isOpen">
      <UiCollapsibleTrigger class="w-full p-2 text-left">
        <div class="flex w-full gap-1">
          {{ props.item.title }}
          <Icon
            :name="isOpen ? 'lucide:chevrons-down-up' : 'lucide:chevrons-up-down'"
            size="12"
            class="ml-auto self-center"
          />
        </div>
      </UiCollapsibleTrigger>
      <UiCollapsibleContent>
        <ul class="pl-2">
          <li
            v-for="link in props.item.links"
            :key="link.title"
          >
            <NuxtLink
              :to="link.to"
              :target="link.to"
              class="mb-1 block w-full gap-2 rounded-md px-3 py-2 transition-all hover:bg-muted"
            >
              <div class="font-semibold">
                {{ link.title }}
              </div>
              <div class="text-sm text-muted-foreground">
                {{ link.description }}
              </div>
            </NuxtLink>
          </li>
        </ul>
      </UiCollapsibleContent>
    </UiCollapsible>
  </template>
  <NuxtLink
    v-else
    :to="props.item.to"
    :target="props.item.target"
    class="flex w-full p-2"
  >
    {{ props.item.title }}
    <Icon
      v-if="props.item.showLinkIcon ?? true"
      name="lucide:arrow-up-right"
      class="ml-1 text-muted-foreground"
      size="12"
    />
  </NuxtLink>
</template>
