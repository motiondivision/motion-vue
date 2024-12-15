<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { ref, watch } from 'vue'
import { Content, useData, useRoute, useRouter } from 'vitepress'
import { SearchIcon } from 'lucide-vue-next'
import type { NavItem } from '../config/docs'
import Logo from '../components/Logo.vue'
import MobileNav from '../components/MobileNav.vue'

import Kbd from '../components/Kbd.vue'

import { Button } from '@/lib/registry/new-york/ui/button'
import RadixIconsGithubLogo from '~icons/radix-icons/github-logo'
import LightDarkSwitch from './LightDarkSwitch.vue'

const { frontmatter, isDark, site } = useData()
const $route = useRoute()
const $router = useRouter()

const links = [
  {
    name: 'GitHub',
    href: 'https://github.com/rick-hup/motion-vue',
    icon: RadixIconsGithubLogo,
  },
  // {
  //   name: 'X',
  //   href: 'https://x.com',
  //   icon: RadixIconsGithubLogo,
  // },
]

const isOpen = ref(false)
const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    isOpen.value = true
})

function handleSelectLink(item: NavItem) {
  if (item.external)
    window.open(item.href, '_blank')
  else
    $router.go(item.href)

  isOpen.value = false
}

watch(() => $route.path, (n) => {
  // @ts-expect-error View Transition API not supported by all the browser yet
  if (document.startViewTransition) {
    // @ts-expect-error View Transition API not supported by all the browser yet
    document.startViewTransition(() => {
      console.log('soft navigating to: ', n)
    })
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col  dark:bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] bg-[radial-gradient(#00000021_1px,transparent_1px)]">
    <header class="sticky z-40 top-0 bg-background/75  backdrop-blur-lg  border-border">
      <div class="container mx-auto flex items-center justify-between h-16 px-4">
        <MobileNav />

        <div class="mr-4 hidden md:flex">
          <Logo />
        </div>

        <div class=" flex items-center justify-end space-x-4 ">
          <Button
            variant="outline"
            class="w-72 h-8 px-3 hidden lg:flex lg:justify-between lg:items-center"
            @click="isOpen = true"
          >
            <div class="flex items-center">
              <SearchIcon class="w-4 h-4 mr-2 text-muted-foreground" />
              <span class="text-muted-foreground"> Search for anything... </span>
            </div>
            <div class="flex items-center gap-x-1">
              <Kbd> <span>⌘</span>K </Kbd>
            </div>
          </Button>

          <div class="flex items-center gap-x-1">
            <Button
              v-for="link in links"
              :key="link.name"
              as="a"
              :href="link.href"
              target="_blank"
              variant="ghost"
              size="icon"
            >
              <component
                :is="link.icon"
                class="w-[20px] h-[20px]"
              />
            </Button>

            <LightDarkSwitch />
          </div>
        </div>
      </div>
    </header>

    <div class="flex-1  ">
      <!-- eslint-disable-next-line vue/require-component-is -->
      <component
        is="docs"
        v-if="$route.path.includes('docs')"
      >
        <Content :key="$route.path" />
      </component>
      <!-- eslint-disable-next-line vue/require-component-is -->
      <component
        is="examples"
        v-else-if="$route.path.includes('examples')"
      >
        <Content :key="$route.path" />
      </component>
      <component
        :is="frontmatter.layout"
        v-else-if="frontmatter.layout"
      >
        <slot />
      </component>
      <main
        v-else
        class="container"
      >
        <Content :key="$route.path" />
      </main>
    </div>
  </div>
</template>
