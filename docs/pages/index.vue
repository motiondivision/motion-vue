<script setup lang="ts">
// const { page } = useContent()
// const config = useConfig()

// useSeoMeta({
//   // title: `${page.value?.title ?? '404'} - ${config.value.site.name}`,
//   // ogTitle: page.value?.title,
//   // description: page.value?.description,
//   // ogDescription: page.value?.description,
//   // ogImage: config.value.site.ogImage,
//   twitterCard: 'summary_large_image',
// })
</script>

<template>
  <div
    class="px-4 py-6 md:px-8"
  >
    <ContentDoc />
  </div>
</template>
