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
  { path: '/press', name: 'Press Animation' },
  { path: '/hover', name: 'Hover Animation' },
  { path: '/in-view', name: 'In View Animation' },
  { path: '/drag', name: 'Drag Animation' },
  { path: '/motion-config', name: 'Motion Config' },
  { path: '/app-card', name: 'App Card' },
  { path: '/share-layout', name: 'Share Layout' },
  { path: '/animate-present-initial', name: 'Animate Present Initial' },
  { path: '/animate-variants', name: 'Animate Variants' },
  { path: '/change-style', name: 'Change Style' },
  { path: '/animated-tooltip', name: 'Animated Tooltip' },
]
const isShow = ref(false)
</script>

<template>
  <div class="p-8 h-screen overflow-auto bg-gradient-to-tr from-[#7b2ff7] to-[#f107a3]">
    <h1 class="text-2xl flex max-sm:flex-col gap-2 place-items-center border-b border-white py-3 font-bold text-white">
      Motion-V 动画演示
      <button class="text-sm px-3 max-sm:ml-0 rounded-md shadow-md py-1 ml-auto bg-white hover:bg-gray-200 transition-all duration-300 text-black">
        Open Sandbox
      </button>
    </h1>
    <h2 class="text-lg font-semibold max-sm:text-center text-gray-200 py-3">
      These are some examples of Motion-V animations.
    </h2>
    <div class="flex flex-wrap gap-3 max-sm:justify-center">
      <NuxtLink
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        class="w-[250px] p-4 py-8 flex place-items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
      >
        {{ route.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
