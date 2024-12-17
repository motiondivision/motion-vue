<script setup lang="ts">
import { SandpackCodeEditor, SandpackConsole, SandpackLayout, SandpackPreview, SandpackProvider, defaultDark, defaultLight } from 'sandpack-vue3'
import { postcssConfig, styleCss, tailwindConfig } from './config'

export interface SandpackProps {
  files: Record<string, any>
  autorun?: boolean
}
const { files, autorun = true } = defineProps<SandpackProps>()
// Default Theme
const className = 'bg-background'

const defaultEditorOptions = {
  showTabs: true,
  showNavigator: true,
  showInlineErrors: true,
  showLineNumbers: true,
  editorHeight: 520,
}

const allfiles = computed(() => {
  return {
    ...files,
    'tailwind.config.js': {
      code: tailwindConfig,
    },
    'postcss.config.js': {
      code: postcssConfig,
    },
    '/src/stylesl.css': {
      code: styleCss,
    },
  }
})
const consoleKey = ref(0)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const selectedTab = ref('preview')
</script>

<template>
  <UiTooltipProvider>
    <SandpackProvider
      :theme="isDark ? defaultDark : defaultLight"
      template="vite-vue-ts"
      :files="allfiles"
      :custom-setup="{
        dependencies: {
          'vue': '3.3.0',
          'motion-v': 'latest',
          'tailwindcss': '^3.4.13',
          'postcss': '^8.4.31',
        },
      }"
      :options="{
        autorun,
      }"
    >
      <SandpackLayout>
        <div
          class="flex flex-col  w-full sm:w-1/2  justify-between gap-0"
          :style="{
            height: `${defaultEditorOptions.editorHeight}px`,
          }"
        >
          <CodeTabs v-model="selectedTab" />
          <SandpackConsole
            :key="consoleKey"
            show-header
            :style="{
              height: `${defaultEditorOptions.editorHeight - 40}px`,
              display: selectedTab === 'console' ? 'flex' : 'none',
            }"
          />
          <SandpackPreview
            :show-refresh-button="false"
            :show-open-in-code-sandbox="false"
            :style="{
              height: `${defaultEditorOptions.editorHeight}px`,
              display: selectedTab === 'preview' ? 'flex' : 'none',
            }"
          />

        <!-- , -->
        </div>
        <SandpackCodeEditor
          v-bind="defaultEditorOptions"
          :show-run-button="false"
          :style="{
            borderLeft: '1px solid var(--border-color)',
            height: `${defaultEditorOptions.editorHeight}px`,
          }"
        />
      </SandpackLayout>
    </SandpackProvider>
  </UiTooltipProvider>
</template>

<style scoped />
