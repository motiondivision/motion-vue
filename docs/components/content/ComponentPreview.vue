<script setup lang="ts">
const { name, files } = defineProps<{
  name: string
  files: Array<{
    name: string
    code: string
    highlightedCode: string
  }>
}>()
const Component = defineAsyncComponent({
  loader: () => import(`@/components/demo/${name}/index.vue`),
})

const activeTab = ref(0)
const lang = computed(() => {
  return files[activeTab.value]?.name.split('.').pop()
})
</script>

<template>
  <div class="border rounded-lg">
    <div class="p-4 border-b">
      <component :is="Component" />
    </div>

    <div class="border-t">
      <div class="flex border-b">
        <button
          v-for="(file, index) in files"
          :key="file.name"
          class="px-4 py-2 text-sm"
          :class="{ 'border-b-2 border-primary': activeTab === index }"
          @click="activeTab = index"
        >
          {{ file.name }}
        </button>
      </div>
      <MDC
        :value="`\`\`\`${lang}\n${files[activeTab]?.code}\n\`\`\``"
        class="[&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none [&>div]:!mb-0"
      />
    </div>
  </div>
</template>

<style scoped>
pre {
  margin: 0;
  background: #f5f5f5;
}

.line {
  display: block;
  min-height: 1rem;
}
</style>
