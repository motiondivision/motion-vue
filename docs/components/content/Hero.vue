<script setup lang="ts">
import pkg from '../../../package.json'
import { slideUp } from '@/lib/motion'

const {
  announcement,
  actions,
} = defineProps<{
  announcement?: {
    to?: string
    target?: Target
    icon?: string
    title: string
  }
  actions: [{
    name: string
    leftIcon?: string
    rightIcon?: string
    variant?: 'default' | 'link' | 'destructive' | 'outline' | 'secondary' | 'ghost'
    to: string
    target?: Target
  }]
}>()
</script>

<template>
  <Motion
    as="section"
    initial="hidden"
    in-view="visible"
    :transition="{
      type: 'spring',
      stiffness: 260,
      damping: 50,
      staggerChildren: 0.2,
    }"
    class="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20"
  >
    <Motion
      v-bind="slideUp"
      as-child
    >
      <NuxtLink
        v-if="announcement"
        :to="announcement.to"
        :target="announcement.target"
        class="inline-flex items-center group rounded-lg bg-muted px-3 py-1 text-sm font-medium"
      >
        <template v-if="announcement.icon">
          <SmartIcon
            :name="announcement.icon"
            :size="16"
          />
          <UiSeparator
            class="mx-2 h-4"
            orientation="vertical"
          />
        </template>
        <span>
          {{ pkg.version }}
        </span>
        <SmartIcon
          name="lucide:arrow-right"
          class="ml-1 size-4 transition-transform group-hover:translate-x-1"
        />
      </NuxtLink>
    </Motion>

    <Motion
      as="h1"
      v-bind="slideUp"
      class="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]"
    >
      <ContentSlot
        :use="$slots.title"
        unwrap="p"
      />
    </Motion>
    <Motion
      as="section"
      v-bind="slideUp"
    >
      <span class="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
        <ContentSlot
          :use="$slots.description"
          unwrap="p"
        />
      </span>

      <section class="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
        <NuxtLink
          v-for="(action, i) in actions"
          :key="i"
          :to="action.to"
          :target="action.target"
        >
          <UiButton :variant="action.variant">
            <SmartIcon
              v-if="action.leftIcon"
              :name="action.leftIcon"
              class="mr-1"
            />
            {{ action.name }}
            <Icon
              v-if="action.rightIcon"
              :name="action.rightIcon"
              class="ml-1"
            />
          </UiButton>
        </NuxtLink>
      </section>
    </Motion>
  </motion>
</template>
