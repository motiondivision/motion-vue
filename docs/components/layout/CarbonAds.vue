<!-- Ported from Vitepress -->
<script setup lang="ts">
const { carbonAds } = useConfig().value.toc
const container = ref()

const isInitialized = ref(false)

function init() {
  if (!isInitialized.value) {
    isInitialized.value = true
    const s = document.createElement('script')
    s.type = 'text/javascript'
    s.id = '_carbonads_js'
    s.src = `//cdn.carbonads.com/carbon.js?serve=${carbonAds.code}&placement=${carbonAds.placement}&format=${carbonAds.format}`
    s.async = true
    container.value.appendChild(s)
  }
}

watch(() => useRoute().path, () => {
  if (isInitialized.value) {
    ;(window as any)._carbonads?.refresh()
  }
})

if (carbonAds.enable) {
  onMounted(() => {
    init()
  })
}
</script>

<template>
  <div
    ref="container"
    class="mt-6"
  />
</template>

<style>
.carbon-responsive-wrap {
  @apply bg-background border-border px-4 py-6 rounded-lg flex flex-col items-center !important;
}

.carbon-responsive-wrap .carbon-img {
  @apply flex-none rounded overflow-hidden !important;
}

.carbon-responsive-wrap .carbon-text {
  @apply text-muted-foreground text-sm flex-none text-center !important;
}

#carbonads .carbon-poweredby {
  @apply bg-background text-muted-foreground block text-right text-[10px] uppercase no-underline !important;
}
</style>
