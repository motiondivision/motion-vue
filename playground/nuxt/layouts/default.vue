<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0b] text-white antialiased">
    <!-- Top glow -->
    <div
      class="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(123,47,247,0.18),transparent_70%)]"
    />

    <!-- Header -->
    <header class="relative border-b border-white/5">
      <div class="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
        <NuxtLink
          to="/"
          class="flex items-center gap-3"
        >
          <img
            src="/logo.png"
            class="w-8 rounded-md"
            alt="Motion for Vue"
          >
          <span class="text-lg font-semibold tracking-tight">Motion for Vue</span>
        </NuxtLink>
        <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60">
          Playground
        </span>
        <NuxtLink
          v-if="!isHome"
          to="/"
          class="ml-auto text-sm text-white/50 transition-colors hover:text-white"
        >
          ← 返回示例
        </NuxtLink>
        <a
          v-else
          href="https://motion.dev"
          target="_blank"
          rel="noopener"
          class="ml-auto text-sm text-white/50 transition-colors hover:text-white"
        >
          motion.dev ↗
        </a>
      </div>
    </header>

    <main class="relative">
      <slot />
    </main>
  </div>
</template>
