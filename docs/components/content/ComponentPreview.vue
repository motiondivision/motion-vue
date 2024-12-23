<script setup lang="ts">
import SmartIcon from './SmartIcon.vue'

const props = defineProps<{
  name: string
  files: Array<{
    name: string
    code: string
    highlightedCode: string
  }>
}>()
const Component = defineAsyncComponent({
  loader: () => import(`@/components/demo/${props.name}/index.vue`),
})

const activeTab = ref(0)
const key = ref(0)
const tabs = ['Preview', 'Code']
const viewType = ref(tabs[0])
</script>

<template>
  <UiTabs
    v-model="viewType"
    class="mt-4"
  >
    <UiTabsList>
      <UiTabsTrigger
        v-for="tab in tabs"
        :key="tab"
        :value="tab"
      >
        <UiTabsTitle>
          {{ tab }}
        </UiTabsTitle>
      </UiTabsTrigger>
    </UiTabsList>
  </UiTabs>
  <div
    class="border rounded-lg mt-4 relative"
  >
    <template v-if="viewType === 'Preview'">
      <Motion
        :key="key"
        :as-child="true"
        :initial="{ rotate: 0 }"
        :animate="{ rotate: 360 }"
        :transition="{
          type: 'spring',
        }"
        class="absolute right-3 w-5 h-5 top-2 z-10 p-1.5 "
        @click="key++"
      >
        <SmartIcon
          name="mdi:refresh"
          class=" text-muted-foreground hover:text-primary  cursor-pointer  rounded-full "
        />
      </Motion>
      <div
        :key="key"
        class="p-4 py-16 overflow-auto border-b flex justify-center items-center relative"
      >
        <component :is="Component" />
      </div>
    </template>

    <div
      v-else
      class="border-t"
    >
      <div class="flex border-b">
        <button
          v-for="(file, index) in props.files"
          :key="file.name"
          class="px-4 py-2 text-sm relative text-muted-foreground hover:text-primary"
          :class="{ 'text-primary': activeTab === index }"
          @click="activeTab = index"
        >
          {{ file.name }}
          <div
            class="absolute bottom-0 left-1/2 w-1/2 -translate-x-1/2 "
          >
            <Motion
              v-if="activeTab === index"
              :layout-id="`code-${props.name}-tab-id`"
              class="h-1 bg-primary rounded-full"
            />
          </div>
        </button>
      </div>
      <div
        class="[&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none [&>div]:!mb-0"
      >
        <slot
          :name="`slot-${activeTab}`"
        >
          {{ props.files[activeTab]?.name }}
        </slot>
      </div>
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
