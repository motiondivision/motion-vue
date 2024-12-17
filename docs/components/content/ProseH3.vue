<script setup lang="ts">
const { id } = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(() => id && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true) || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h3)))
</script>

<template>
  <h3
    :id
    class="scroll-m-20 text-2xl font-semibold tracking-tight [&:not(:first-child)]:mt-8"
  >
    <NuxtLink
      v-if="id && generate"
      :to="`#${id}`"
    >
      <slot />
    </NuxtLink>
    <slot v-else />
  </h3>
</template>
