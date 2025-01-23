<script setup lang="ts">
const props = defineProps<{ isMobile: boolean }>()
defineEmits(['close'])
const { navigation } = useContent()
const config = useConfig()

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
