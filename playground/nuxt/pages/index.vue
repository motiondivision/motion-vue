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
// toggle for sandbox mode
const sandboxMode = ref(false)
</script>

<template>
  <div class="p-8 text-white py-2 flex flex-col gap-3 h-screen gradient-pink-violet">
    <div class="text-2xl flex max-sm:flex-col gap-2 place-items-center border-b border-white pb-3 font-bold ">
      <img
        src="/logo.svg"
        class="w-10"
        alt=""
      >
      Motion-V 动画演示
      <span class="border-l text-sm border-white px-3">
        playground
      </span>
      <button
        class="text-sm px-4 max-sm:ml-0 rounded-md shadow-md py-2 ml-auto bg-white hover:bg-gray-200 transition-all duration-200 text-black"
        @click="sandboxMode = !sandboxMode"
      >
        Go To Sandbox
      </button>
    </div>
    <!-- Example Demos List -->
    <div
      v-if="!sandboxMode"
      class="demos"
    >
      <h2 class="text-lg font-semibold max-sm:text-center text-gray-200 py-3">
        These are some examples of Motion-V animations.
      </h2>
      <div class="flex flex-wrap gap-3 max-sm:justify-center">
        <NuxtLink
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          class="w-[240px] p-4 py-8 flex place-items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
        >
          {{ route.name }}
        </NuxtLink>
      </div>
    </div>
    <!-- Sandbox View -->
    <div class="flex-1">
      <Sandbox v-if="sandboxMode" />
    </div>
  </div>
</template>

<style scoped>

</style>
