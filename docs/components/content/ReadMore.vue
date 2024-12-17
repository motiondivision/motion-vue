<script setup lang="ts">
const {
  title,
  to,
  icon = 'lucide:bookmark',
  target = 'self',
} = defineProps<{
  title?: string
  to: string
  target?: Target
  icon?: string
}>()

const computedTitle = computed<string>(
  () => {
    if (title)
      return title

    try {
      return useBreadcrumb(to).map(x => x.title).join(' > ')
    }
    catch {
      return to
    }
  },
)
</script>

<template>
  <Alert
    :to
    :target
    :icon
  >
    Read more at <span class="font-semibold">{{ computedTitle }}</span>
  </Alert>
</template>
