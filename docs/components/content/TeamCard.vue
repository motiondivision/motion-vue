<script setup lang="ts">
const { center = true, avatar, name, title, links } = defineProps<{
  avatar: string
  name: string
  title?: string
  links?: ({
    icon: string
    to: string
    target?: Target
  })[]
  center?: boolean
}>()
</script>

<template>
  <UiCard>
    <UiCardHeader>
      <div
        class="flex flex-col gap-3"
        :class="{ 'text-center': center }"
      >
        <UiAvatar :class="{ 'mx-auto': center }">
          <UiAvatarImage
            :src="avatar"
            :alt="name"
          />
        </UiAvatar>
        <div>
          <div class="text-lg font-bold">
            {{ name }}
          </div>
          <div class="text-sm text-muted-foreground">
            {{ title }}
          </div>
        </div>
        <div
          class="flex gap-3 text-secondary-foreground"
          :class="{ 'mx-auto': center }"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
          >
            <SmartIcon :name="link.icon" />
          </NuxtLink>
        </div>
      </div>
    </UiCardHeader>
  </UiCard>
</template>
