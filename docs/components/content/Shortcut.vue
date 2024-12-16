<script setup lang="ts">
const { value, size = 'sm' } = defineProps<{
  value: string
  size?: 'xs' | 'sm' | 'md'
}>()

const metaSymbol = ref('Ctrl')
onMounted(() => {
  metaSymbol.value = navigator && navigator.userAgent && navigator.userAgent.match(/Macintosh;/) ? '⌘' : 'Ctrl'
})

const computedValue = computed(() => value === 'meta' ? metaSymbol : value)
</script>

<template>
  <Kbd :size>
    {{ computedValue }}
  </Kbd>
</template>
