<script setup lang="ts">
const show = ref(true)
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center">
      Preset Directives
    </h1>

    <div class="grid grid-cols-2 gap-6 mb-8">
      <!-- v-fade-in: registered globally via Nuxt module presets -->
      <div>
        <h2 class="font-semibold mb-1">
          v-fade-in
        </h2>
        <p class="text-sm text-gray-400 mb-2">
          Global preset from nuxt.config
        </p>
        <div
          v-fade-in
          class="w-44 h-24 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold"
        >
          Fade In
        </div>
      </div>

      <!-- v-slide-up: registered globally via Nuxt module presets -->
      <div>
        <h2 class="font-semibold mb-1">
          v-slide-up
        </h2>
        <p class="text-sm text-gray-400 mb-2">
          Global preset from nuxt.config
        </p>
        <div
          v-slide-up
          class="w-44 h-24 bg-purple-500 rounded-xl flex items-center justify-center text-white font-semibold"
        >
          Slide Up
        </div>
      </div>

      <!-- v-motion: registered globally via directives: true -->
      <div>
        <h2 class="font-semibold mb-1">
          v-motion
        </h2>
        <p class="text-sm text-gray-400 mb-2">
          Global directive via directives: true
        </p>
        <div
          v-motion="{ initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 } }"
          class="w-44 h-24 bg-pink-500 rounded-xl flex items-center justify-center text-white font-semibold"
        >
          Motion
        </div>
      </div>
    </div>

    <!-- Toggle -->
    <div>
      <h2 class="font-semibold mb-1">
        Toggle
      </h2>
      <button
        class="px-4 py-2 rounded bg-white text-black mb-3"
        @click="show = !show"
      >
        {{ show ? 'Hide' : 'Show' }}
      </button>
      <div class="h-28 relative">
        <div
          v-if="show"
          v-fade-in
          class="w-44 h-24 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold"
        >
          Toggle me
        </div>
      </div>
    </div>
  </div>
</template>
