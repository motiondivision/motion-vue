<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { VisuallyHidden } from 'radix-vue'

const { darkModeToggle } = useConfig().value.header

const open = defineModel<boolean>('open')
const colorMode = useColorMode()
const { placeholderDetailed } = useConfig().value.search

const activeSelect = ref(0)

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})
watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    open.value = true
})

const input = ref('')
const searchResult = ref()
const searchLoading = ref(false)
watch(
  input,
  async (v) => {
    activeSelect.value = 0
    if (!v)
      return

    searchLoading.value = true
    searchResult.value = (await searchContent(v)).value
    searchLoading.value = false
  },
)

function getHighlightedContent(text: string) {
  return text.replace(input.value, `<span class="font-semibold underline">${input.value}</span>`)
}

const { navKeyFromPath } = useContentHelpers()
const { navigation } = useContent()
function getItemIcon(path: string) {
  return navKeyFromPath(path, 'icon', navigation.value)
}

watch(activeSelect, (value) => {
  document.querySelector(`[id="${value}"]`)?.scrollIntoView({ block: 'nearest' })
})

async function handleEnter() {
  if (searchResult.value[activeSelect.value]?.id) {
    await navigateTo(searchResult.value[activeSelect.value].id)
    open.value = false
  }
}

function handleNavigate(delta: -1 | 1) {
  if (activeSelect.value + delta >= 0 && activeSelect.value + delta < searchResult.value.length)
    activeSelect.value += delta
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="p-0">
      <VisuallyHidden as-child>
        <UiDialogTitle />
      </VisuallyHidden>
      <VisuallyHidden as-child>
        <UiDialogDescription aria-describedby="undefined" />
      </VisuallyHidden>
      <UiCommand
        v-model:search-term="input"
        class="h-svh sm:h-[350px]"
      >
        <UiCommandInput
          :loading="searchLoading"
          :placeholder="placeholderDetailed"
          @keydown.enter="handleEnter"
          @keydown.down="handleNavigate(1)"
          @keydown.up="handleNavigate(-1)"
        />
        <UiCommandList
          class="text-sm"
          @escape-key-down="open = false"
        >
          <template v-if="!input?.length">
            <template
              v-for="item in navigation"
              :key="item._path"
            >
              <UiCommandGroup
                v-if="item.children"
                :heading="item.title"
                class="p-1.5"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.id"
                  :to="child._path"
                >
                  <UiCommandItem :value="child._path">
                    <Icon
                      v-if="child.icon"
                      :name="child.icon"
                      class="mr-2 size-4"
                    />
                    <div
                      v-else
                      class="mr-2 size-4"
                    />
                    <span>{{ child.title }}</span>
                  </UiCommandItem>
                </NuxtLink>
              </UiCommandGroup>
              <UiCommandSeparator v-if="item.children" />
            </template>
            <UiCommandGroup
              v-if="darkModeToggle"
              heading="Theme"
              class="p-1.5"
            >
              <UiCommandItem
                value="light"
                @click="colorMode.preference = 'light'"
              >
                <Icon
                  name="lucide:sun"
                  class="mr-2 size-4"
                />
                <span>Light</span>
              </UiCommandItem>
              <UiCommandItem
                value="dark"
                @click="colorMode.preference = 'dark'"
              >
                <Icon
                  name="lucide:moon"
                  class="mr-2 size-4"
                />
                <span>Dark</span>
              </UiCommandItem>
              <UiCommandItem
                value="system"
                @click="colorMode.preference = 'auto'"
              >
                <Icon
                  name="lucide:monitor"
                  class="mr-2 size-4"
                />
                <span>System</span>
              </UiCommandItem>
            </UiCommandGroup>
          </template>

          <div
            v-else-if="searchResult?.length"
            class="p-1.5"
          >
            <NuxtLink
              v-for="(item, i) in searchResult"
              :id="i"
              :key="item.id"
              :to="item.id"
              class="flex select-none rounded-md p-2 hover:cursor-pointer hover:bg-muted"
              :class="[i === activeSelect && 'bg-muted']"
              @click="open = false; activeSelect = i;"
            >
              <Icon
                v-if="getItemIcon(item.id)"
                :name="getItemIcon(item.id)"
                class="mr-2 size-4 shrink-0 self-center"
              />
              <div
                v-else
                class="mr-2 size-4 shrink-0"
              />

              <span
                v-for="(subtitle, j) in item.titles"
                :key="`${subtitle}${j}`"
                class="flex shrink-0 self-center"
              >
                {{ subtitle }}
                <Icon
                  name="lucide:chevron-right"
                  class="mx-0.5 self-center text-muted-foreground"
                />
              </span>
              <span class="shrink-0 self-center">
                {{ item.title }}
              </span>
              <span
                class="ml-2 self-center truncate text-xs text-muted-foreground"
                v-html="getHighlightedContent(item.content)"
              />
            </NuxtLink>
          </div>

          <div
            v-else
            class="pt-4 text-center text-muted-foreground"
          >
            No results found.
          </div>
        </UiCommandList>
      </UiCommand>
    </UiDialogContent>
  </UiDialog>
</template>
