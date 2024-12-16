<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => useBreadcrumb(route.path))
</script>

<template>
  <UiBreadcrumb>
    <UiBreadcrumbList>
      <template
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.title"
      >
        <UiBreadcrumbItem>
          <UiBreadcrumbLink
            :href="index === 0 ? undefined : breadcrumb.href"
            :class="{ 'text-foreground': index === breadcrumbs.length - 1 }"
          >
            {{ breadcrumb.title }}
          </UiBreadcrumbLink>
        </UiBreadcrumbItem>
        <UiBreadcrumbSeparator v-if="index !== breadcrumbs.length - 1" />
      </template>
    </UiBreadcrumbList>
  </UiBreadcrumb>
</template>
