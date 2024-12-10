<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import PageHeaderHeading from '../components/PageHeaderHeading.vue'
import PageHeaderDescription from '../components/PageHeaderDescription.vue'
import { announcementConfig } from '../config/site'
import GitHubIcon from '~icons/radix-icons/github-logo'

import { Separator } from '@/lib/registry/new-york/ui/separator'

import HomeDemo from './demos/HomeDemo.vue'
import Button from '@/lib/registry/new-york/ui/button/Button.vue'
</script>

<template>
  <PageHeader class="page-header pb-8 items-center mx-auto">
    <div class="text-primary text-opacity-20">
      text
    </div>
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
    <PageHeaderDescription class="max-w-[440px] text-secondary-foreground">
      A Vue 3 motion library to power your app. based on <a
        href="https://motion.dev/docs/animate"
        target="_blank"
      >
        Motion animate
      </a> .
    </PageHeaderDescription>

    <section class="flex w-full items-center justify-center space-x-4 pb-8 pt-4 md:pb-10">
      <Button
        as="a"
        href="/docs/introduction"
        class="rounded-full"
      >
        Get Started
      </Button>
      <Button
        as="a"
        variant="secondary"
        href="https://github.com/rick-hup/motion-vue"
        target="_blank"
        class="rounded-full shadow"
      >
        <GitHubIcon class="mr-2 h-4 w-4" />
        GitHub
      </Button>
    </section>
  </PageHeader>
  <HomeDemo />
</template>
