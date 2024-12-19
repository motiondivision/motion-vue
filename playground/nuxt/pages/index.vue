<script setup lang="ts">
const routes = [
  { path: '/layout', name: 'Basic Layout Animation' },
  { path: '/flex-layout', name: 'Flex Layout Switch Animation' },
  { path: '/scale-correction-z', name: 'Scale Correction Animation' },
  { path: '/layout-id-tabs', name: 'Layout ID Tabs Animation' },
  { path: '/layout-group', name: 'Layout Group Animation' },
  { path: '/pop-layout', name: 'Pop Layout Animation' },
  { path: '/scroll-progress', name: 'Scroll Progress Animation' },
  { path: '/pan', name: 'Pan Animation' },
]
const isShow = ref(true)
function handleClick() {
  isShow.value = !isShow.value
}
</script>

<template>
  <div class="flex flex-col p-8 h-screen bg-gradient-to-tr from-[#7b2ff7] to-[#f107a3]">
    <div class="max-w-md mx-auto w-full space-y-4 mt-20">
      <h1 class="text-2xl font-bold text-white mb-8">
        Motion-V 动画演示
      </h1>
      <NuxtLink
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        class="block p-4 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
      >
        {{ route.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
