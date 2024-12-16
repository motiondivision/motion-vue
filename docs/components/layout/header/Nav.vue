<script setup lang="ts">
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'

const { nav } = useConfig().value.header
</script>

<template>
  <UiNavigationMenu>
    <UiNavigationMenuList>
      <UiNavigationMenuItem
        v-for="(item, i) in nav"
        :key="i"
        class="relative"
      >
        <template v-if="item.links">
          <UiNavigationMenuTrigger class="bg-transparent font-semibold">
            {{ item.title }}
          </UiNavigationMenuTrigger>
          <UiNavigationMenuContent>
            <ul class="w-[250px] p-2">
              <li
                v-for="link in item.links"
                :key="link.title"
              >
                <NuxtLink
                  :to="link.to"
                  :target="link.target"
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
          </UiNavigationMenuContent>
        </template>
        <NuxtLink
          v-else
          :to="item.to"
          :target="item.target"
        >
          <Icon
            v-if="item.showLinkIcon ?? true"
            name="lucide:arrow-up-right"
            class="absolute right-2 top-2 text-muted-foreground"
            size="13"
          />
          <div
            class="bg-transparent font-semibold"
            :class="[navigationMenuTriggerStyle(), (item.showLinkIcon ?? true) && 'pr-6']"
          >
            {{ item.title }}
          </div>
        </NuxtLink>
      </UiNavigationMenuItem>
    </UiNavigationMenuList>
  </UiNavigationMenu>
</template>
