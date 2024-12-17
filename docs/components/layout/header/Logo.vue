<script setup lang="ts">
const { logo, title, showTitle } = useConfig().value.header
</script>

<template>
  <div>
    <NuxtLink
      v-if="logo.light && logo.dark"
      to="/"
      class="flex"
    >
      <NuxtImg
        :src="logo.light"
        class="h-7 dark:hidden"
      />
      <NuxtImg
        :src="logo.dark"
        class="hidden h-7 dark:block"
      />
      <span
        v-if="showTitle && title"
        class="ml-3 self-center font-bold"
      >
        {{ title }}
      </span>
    </NuxtLink>
  </div>
</template>
