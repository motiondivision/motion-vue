<script setup lang="ts">
const {
  to,
  target,
  type = 'default',
  external = undefined,
  inStack = false,
  showLinkIcon = true,
  title,
  icon,
} = defineProps<{
  title?: string
  icon?: string
  type?: 'default' | 'info' | 'warning' | 'success' | 'danger' | 'secondary'
  to?: string
  target?: Target
  external?: boolean
  inStack?: boolean
  showLinkIcon?: boolean
}>()

const typeTwClass = {
  default: '',
  info: 'border-sky-600 text-sky-600 [&>svg]:text-sky-600',
  note: 'border-blue-700 text-blue-700 [&>svg]:text-blue-700',
  example: 'border-violet-600 text-violet-600 [&>svg]:text-violet-600',
  warning: 'border-amber-600 text-amber-600 [&>svg]:text-amber-600',
  success: 'border-green-600 text-green-600 [&>svg]:text-green-600',
  danger: 'border-red-600 text-red-600 [&>svg]:text-red-600',
  secondary: 'bg-muted/50',
}

async function alertClick() {
  if (to) {
    if (target) {
      await navigateTo(to, {
        external: external ?? to.startsWith('http'),
        open: { target },
      })
    }
    else {
      await navigateTo(to, {
        external: external ?? to.startsWith('http'),
      })
    }
  }
}
</script>

<template>
  <UiAlert
    class="transition-all [&:not(:first-child)]:mt-5"
    :class="[
      typeTwClass[type],
      to && 'cursor-pointer hover:bg-muted/50',
      inStack && 'm-0 rounded-none border-none',
    ]"
    @click="alertClick"
  >
    <Icon
      v-if="icon && title"
      :name="icon"
      :size="16"
    />
    <UiAlertTitle
      v-if="title"
      class="font-semibold"
    >
      {{ title }}
    </UiAlertTitle>
    <UiAlertDescription>
      <div class="flex flex-row gap-2">
        <Icon
          v-if="icon && !title"
          :name="icon"
          :size="16"
          class="mb-[2px] min-w-5 self-center"
        />
        <span
          class="w-full"
          :class="[to && 'pr-3']"
        >
          <slot />
        </span>
      </div>
      <Icon
        v-if="to && showLinkIcon"
        name="lucide:arrow-up-right"
        class="absolute right-4 top-4"
      />
    </UiAlertDescription>
  </UiAlert>
</template>
