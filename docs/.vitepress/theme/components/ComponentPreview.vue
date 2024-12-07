<script setup lang="ts">
// import StyleSwitcher from './StyleSwitcher.vue'
import ComponentLoader from './ComponentLoader.vue'
import Stackblitz from './Stackblitz.vue'
import CodeSandbox from './CodeSandbox.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/registry/new-york/ui/tabs'
import { cn } from '@/lib/utils'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Motion } from 'motion-v'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  name: string
  align?: 'center' | 'start' | 'end'
  sfcTsCode?: string
  sfcTsHtml?: string
}>(), { align: 'center' })
const key = ref(0)
</script>

<template>
  <div
    class="not-docs group relative my-4 flex flex-col space-y-2"
  >
    <Tabs
      default-value="preview"
      class="relative mr-auto w-full"
    >
      <div class="flex items-center justify-between pb-3">
        <TabsList class="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="preview"
            class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="code"
            class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Code
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="preview"
        class="relative rounded-md border"
      >
        <div class="flex items-center justify-end p-4">
          <!-- <StyleSwitcher /> -->

          <div class="flex items-center gap-x-1">
            <Motion
              :key="`${key}-refresh`"
              :as-child="true"
              :initial="{ rotate: 0 }"
              :animate="{ rotate: 360 }"
              :transition="{
                type: 'spring',
              }"
            >
              <Icon
                icon="mdi:refresh"
                class=" bottom-4 right-4 w-7 h-7 cursor-pointer  rounded-full p-1.5 "
                @click="key++"
              />
            </Motion>
            <Stackblitz
              :key="key"
              :name="name"
              :code="decodeURIComponent(sfcTsCode ?? '')"
            />
            <CodeSandbox
              :key="`${key}-`"
              :name="name"
              :code="decodeURIComponent(sfcTsCode ?? '')"
            />
          </div>
        </div>
        <div
          :class="cn('preview flex min-h-[350px] w-full justify-center p-10 items-center', {
            'items-center': align === 'center',
            'items-start': align === 'start',
            'items-end': align === 'end',
          })"
        >
          <ComponentLoader
            v-bind="$attrs"
            :fresh="key"
            :name="name"
          />
        </div>
      </TabsContent>
      <TabsContent
        value="code"
      >
        <div
          v-if="sfcTsHtml"
          class="language-vue"
          style="flex: 1;"
          v-html="`<button title='Copy Code' class='copy'></button><span class='lang'>vue</span>${decodeURIComponent(sfcTsHtml)}`"
        />
        <slot v-else />
      </TabsContent>
    </Tabs>
  </div>
</template>
