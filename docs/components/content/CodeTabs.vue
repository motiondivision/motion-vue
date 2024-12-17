<script setup lang="ts">
import { UiTabs as Tabs, UiTabsList as TabsList, UiTabsTrigger as TabsTrigger } from '#components'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const currentView = computed({
  get: () => props.modelValue ?? 'preview',
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <div class="w-full flex justify-between border-b border-solid border-border">
    <Tabs
      v-model="currentView"
      class="w-full"
    >
      <TabsList class="h-10 bg-transparent">
        <TabsTrigger
          value="preview"
          class="!bg-transparent !shadow-none"
        >
          Preview
        </TabsTrigger>
        <TabsTrigger
          value="console"
          class="!bg-transparent !shadow-none"
        >
          Console
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <div class="flex items-center  px-4">
      <CustomGoToCodesandboxButton />
      <CustomRunButton />
      <!-- <CustomClearConsoleButton /> -->
    </div>
  </div>
</template>

<style scoped>

</style>
