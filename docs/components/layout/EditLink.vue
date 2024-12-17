<script setup lang="ts">
const { url, enabledDocsFooter, text, icon } = useEditLink()
</script>

<template>
  <div
    v-if="enabledDocsFooter"
    class="mb-6 w-fit"
  >
    <NuxtLink
      :to="url"
      target="_blank"
      class="text-sm font-semibold text-primary"
    >
      <div class="flex items-center gap-2">
        <Icon :name="icon" />
        <span>
          {{ text }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>
