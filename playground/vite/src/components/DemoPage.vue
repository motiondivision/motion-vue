<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-10">
      <p
        v-if="eyebrow"
        class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35"
      >
        {{ eyebrow }}
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50"
      >
        {{ description }}
      </p>
    </header>
    <slot />
  </div>
</template>
