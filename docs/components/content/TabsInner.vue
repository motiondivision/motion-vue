<script setup lang="ts">
import { cn } from '@/lib/utils'
import ScrollBar from '../ui/scroll-area/ScrollBar.vue'
import { usePrevious } from '@vueuse/core'

const { sync, slotsData, variant, padded, inStack, disableSearch, searchPlaceholder, searchEmpty } = defineProps<{
  slotsData: { label: string, index: number }[]
  variant?: 'separate' | 'card' | 'line' | 'combobox'
  padded?: boolean
  inStack?: boolean
  disableSearch?: boolean
  searchPlaceholder?: string
  searchEmpty?: string
  sync?: string
}>()

const syncState = useCookie<{ scope: string, value?: string }[]>('tabs-sync-state', {
  default: () => [],
})

const syncScopeIndex = computed(() => syncState.value.findIndex(x => x.scope === sync))

const activeTabIndexData = ref(0)
const activeTabIndex = computed<number>({
  get: () => {
    if (sync === undefined || syncScopeIndex.value === -1)
      return activeTabIndexData.value

    return slotsData.find(x => x.label === syncState.value[syncScopeIndex.value]?.value)?.index
      || activeTabIndexData.value
  },
  set(index: number) {
    if (sync === undefined) {
      activeTabIndexData.value = index
      return
    }

    if (syncScopeIndex.value === -1)
      syncState.value.push({ scope: sync, value: undefined })

    syncState.value[syncScopeIndex.value].value = slotsData[index].label
    activeTabIndexData.value = index
  },
})
const previousActiveTabIndex = usePrevious(activeTabIndex)
function getZIndex(index: number) {
  if (activeTabIndex.value === index)
    return 10

  if (previousActiveTabIndex.value === index)
    return 11

  return 1
}
const iconMap = new Map(Object.entries(useConfig().value.main.codeIcon))
function icon(props: any) {
  return props?.icon || iconMap.get(props?.filename?.toLowerCase()) || iconMap.get(props?.language)
}

function label(props: any) {
  return props?.label || props?.filename
}

const dropDownOpen = ref(false)
</script>

<template>
  <UiTabs
    v-if="variant === 'separate'"
    v-model="activeTabIndex"
    class="[&:not(:first-child)]:mt-5"
  >
    <UiTabsList>
      <UiTabsTrigger
        v-for="(slot, i) in $slots.default?.() ?? []"
        :key="`${i}${label(slot.props)}`"
        class="bg-transparent"
        :value="i"
      >
        <Icon
          v-if="icon(slot?.props)"
          :name="icon(slot?.props)!"
          class="mr-1.5 self-center"
        />
        {{ label(slot.props) }}
      </UiTabsTrigger>
    </UiTabsList>

    <div
      v-for="(slot, i) in $slots.default?.() ?? []"
      v-show="activeTabIndex === i"
      :key="`${i}${label(slot.props)}`"
      class="mt-2"
    >
      <component :is="slot" />
    </div>
  </UiTabs>

  <UiTabs
    v-else-if="variant === 'line'"
    v-model="activeTabIndex"
    class="relative mr-auto w-full [&:not(:first-child)]:mt-5"
  >
    <div class="flex items-center justify-between pb-3">
      <UiTabsList class="h-9 w-full justify-start rounded-none border-b bg-transparent p-0">
        <UiTabsTrigger
          v-for="(slot, i) in $slots.default?.() ?? []"
          :key="`${i}${label(slot.props)}`"
          :value="i"
          class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          <SmartIcon
            v-if="icon(slot?.props)"
            :name="icon(slot?.props)!"
            class="mr-1.5 self-center"
          />
          {{ label(slot.props) }}
        </UiTabsTrigger>
      </UiTabsList>
    </div>

    <div
      v-for="(slot, i) in $slots.default?.() ?? []"
      v-show="activeTabIndex === i"
      :key="`${i}${label(slot.props)}`"
      class="relative mt-2 space-y-10"
    >
      <component :is="slot" />
    </div>
  </UiTabs>

  <UiCard
    v-else-if="variant === 'card'"
    class="[&:not(:first-child)]:mt-5"
    :class="[inStack && 'mb-0 rounded-none border-none shadow-none']"
  >
    <UiScrollArea>
      <div class="relative flex overflow-x-auto border-b p-0.5 text-sm">
        <div class="flex p-1">
          <div
            v-for="(slot, i) in ($slots.default?.() ?? [])"
            :key="`${i}${label(slot.props)}`"
            :value="label(slot.props)"
            class="flex cursor-pointer  rounded-md px-3 relative py-1.5 text-muted-foreground transition-all duration-75"
            :class="[activeTabIndex === i && ' text-primary']"
            @mousedown.left="activeTabIndex = i"
          >
            <span class="flex items-center z-10">
              <Icon
                v-if="icon(slot?.props)"
                :name="icon(slot?.props)!"
                class="mr-1.5 self-center"
              />
              {{ label(slot.props) }}
            </span>
            <Motion
              v-if="activeTabIndex === i"
              layout-id="install-active-tab"
              class="w-full h-full bg-muted absolute z-0 left-0 top-0 rounded-lg"
            />
          </div>
        </div>
        <CodeCopy
          v-if="$slots.default?.()[activeTabIndex]?.props?.code"
          class="ml-auto mr-3 self-center pl-2"
          :code="$slots.default?.()[activeTabIndex]?.props?.code"
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </UiScrollArea>

    <div
      v-for="(slot, i) in $slots.default?.() ?? []"
      v-show="activeTabIndex === i"
      :key="`${i}${label(slot.props)}`"
      :value="label(slot.props)"
      class="mt-0"
      :class="[padded && ($slots.default?.()[activeTabIndex]?.type as any).tag !== 'pre' && 'p-3']"
    >
      <component
        :is="slot"
        :in-group="true"
      />
    </div>
  </UiCard>

  <div v-else-if="variant === 'combobox'">
    <UiPopover v-model:open="dropDownOpen">
      <UiPopoverTrigger as-child>
        <UiButton
          variant="outline"
          role="combobox"
          :aria-expanded="dropDownOpen"
          class="w-[200px] justify-between"
        >
          <div class="flex items-center">
            <SmartIcon
              v-if="icon(($slots.default?.() ?? [])[activeTabIndex].props)"
              :name="icon(($slots.default?.() ?? [])[activeTabIndex].props)!"
              class="mr-1.5"
            />
            <span>
              {{ label(($slots.default?.() ?? [])[activeTabIndex].props) }}
            </span>
          </div>
          <Icon name="lucide:chevrons-up-down" />
        </UiButton>
      </UiPopoverTrigger>
      <UiPopoverContent class="w-[200px] p-0">
        <UiCommand>
          <UiCommandInput
            v-if="!disableSearch"
            class="h-9"
            :placeholder="searchPlaceholder"
          />
          <UiCommandEmpty>{{ searchEmpty }}</UiCommandEmpty>
          <UiCommandList>
            <UiCommandGroup>
              <UiCommandItem
                v-for="(slot, i) in $slots.default?.() ?? []"
                :key="`${i}${label(slot.props)}`"
                :value="label(slot.props)"
                @select="() => {
                  activeTabIndex = i;
                  dropDownOpen = false;
                }"
              >
                <SmartIcon
                  v-if="icon(slot?.props)"
                  :name="icon(slot?.props)!"
                  class="mr-1.5 self-center"
                />
                {{ label(slot.props) }}
                <Icon
                  name="lucide:check"
                  :class="cn(
                    'ml-auto h-4 w-4',
                    activeTabIndex === i ? 'opacity-100' : 'opacity-0',
                  )"
                />
              </UiCommandItem>
            </UiCommandGroup>
          </UiCommandList>
        </UiCommand>
      </UiPopoverContent>
    </UiPopover>

    <div
      v-for="(slot, i) in $slots.default?.() ?? []"
      v-show="activeTabIndex === i"
      :key="`${i}${label(slot.props)}`"
      :value="label(slot.props)"
      class="mt-4"
    >
      <component
        :is="slot"
        :in-group="true"
      />
    </div>
  </div>
</template>
