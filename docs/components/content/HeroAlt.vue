<script setup lang="ts">
const {
  announcement,
  actions,
  mobileRight,
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
  mobileRight?: 'top' | 'bottom'
}>()
</script>

<template>
  <div
    class="gap-8 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10"
    :class="{ 'grid md:grid-cols-3': $slots.right }"
  >
    <section
      class="flex flex-col items-start gap-2"
      :class="{ 'md:col-span-2': $slots.right }"
    >
      <NuxtLink
        v-if="announcement"
        :to="announcement.to"
        :target="announcement.target"
        class="inline-flex items-center px-0.5 text-sm font-medium"
      >
        <template v-if="announcement.icon">
          <Icon
            :name="announcement.icon"
            :size="16"
          />
          <UiSeparator
            class="mx-2 h-4"
            orientation="vertical"
          />
        </template>
        <span class="underline-offset-4 hover:underline">{{ announcement.title }}</span>
        <Icon
          name="lucide:arrow-right"
          class="ml-1 size-4"
        />
      </NuxtLink>

      <h1 class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
        <ContentSlot
          :use="$slots.title"
          unwrap="p"
        />
      </h1>
      <p class="max-w-2xl text-lg font-light text-foreground">
        <ContentSlot
          :use="$slots.description"
          unwrap="p"
        />
      </p>

      <div class="flex w-full items-center justify-start gap-2 py-2">
        <NuxtLink
          v-for="(action, i) in actions"
          :key="i"
          :to="action.to"
          :target="action.target"
        >
          <UiButton
            :variant="action.variant"
            size="sm"
          >
            <Icon
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
      </div>
    </section>
    <div
      class="mx-auto"
      :class="{ 'order-first md:order-last': mobileRight === 'top' }"
    >
      <ContentSlot
        :use="$slots.right"
        unwrap="p"
      />
    </div>
  </div>
</template>
