<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import PageHeaderHeading from '../components/PageHeaderHeading.vue'
import PageHeaderDescription from '../components/PageHeaderDescription.vue'
import { announcementConfig } from '../config/site'
import GitHubIcon from '~icons/radix-icons/github-logo'

import { buttonVariants } from '@/lib/registry/new-york/ui/button'
import { Separator } from '@/lib/registry/new-york/ui/separator'
import { cn } from '@/lib/utils'

import HomeDemo from './demos/HomeDemo.vue'
</script>

<template>
  <PageHeader class="page-header pb-8">
    <a
      :href="announcementConfig.link"
      class="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
    >
      {{ announcementConfig.icon }}   <Separator
        class="mx-2 h-4"
        orientation="vertical"
      />
      <span class="sm:hidden">{{ announcementConfig.title }}</span>
      <span class="hidden sm:inline">{{ announcementConfig.title }}
      </span>
      <!-- <ArrowRightIcon class="ml-1 h-4 w-4" /> -->
    </a>
    <PageHeaderHeading>Motion Vue</PageHeaderHeading>
    <PageHeaderDescription>
      A Vue 3 motion library to power your app. Based on Framer Motion animate.
    </PageHeaderDescription>

    <section class="flex w-full items-center space-x-4 pb-8 pt-4 md:pb-10">
      <a
        href="/docs/introduction"
        :class="cn(buttonVariants(), 'rounded-[6px]')"
      >
        Get Started
      </a>
      <a
        href="https://github.com/radix-vue/shadcn-vue"
        target="_blank"
        :class="cn(
          buttonVariants({ variant: 'outline' }),
          'rounded-[6px]',
        )"
      >
        <GitHubIcon class="mr-2 h-4 w-4" />
        GitHub
      </a>
    </section>
  </PageHeader>
  <HomeDemo />
</template>
