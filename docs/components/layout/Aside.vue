<script setup lang="ts">
const props = defineProps<{ isMobile: boolean }>()
defineEmits(['close'])
const { navDirFromPath } = useContentHelpers()
const { navigation } = useContent()
const config = useConfig()
const tree = computed(() => {
  const route = useRoute()
  const path = route.path.split('/')
  if (config.value?.aside.useLevel) {
    const leveledPath = path.splice(0, 2).join('/')

    const dir = navDirFromPath(leveledPath, navigation.value)
    return dir ?? []
  }

  return navigation.value
})
onMounted(() => {
  console.log(tree.value, navigation)
})

const path = computed(() => useRoute().path)
</script>

<template>
  <UiScrollArea
    orientation="vertical"
    class="relative h-full overflow-hidden py-6 pr-6 text-sm md:pr-4"
    type="hover"
  >
    <LayoutAsideTree
      :links="navigation"
      :level="0"
      :class="[config?.aside.useLevel ? 'pt-4' : 'pt-1']"
      @click="$emit('close')"
    />
    <!-- <LayoutHeaderNavMobile
      v-if="props.isMobile"
      class="mb-5 border-b pb-2"
    /> -->
  </UiScrollArea>
</template>
