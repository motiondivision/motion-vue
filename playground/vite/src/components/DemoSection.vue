<script setup lang="ts">
defineProps<{
  index: string
  title: string
  note: string
  code: string
}>()
</script>

<template>
  <section class="mb-14">
    <header class="mb-4">
      <div class="flex items-baseline gap-3">
        <span class="font-mono text-[11px] text-white/25">{{ index }}</span>
        <h2 class="text-sm font-medium text-white/80">
          {{ title }}
        </h2>
      </div>
      <p class="mt-2 max-w-[68ch] text-sm leading-relaxed text-white/45">
        {{ note }}
      </p>
    </header>

    <slot />

    <details class="group mt-3">
      <summary class="cursor-pointer list-none font-mono text-[11px] uppercase tracking-[0.18em] text-white/30 hover:text-white/55">
        code
      </summary>
      <pre class="mt-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#08080a] p-4 text-[12px] leading-relaxed text-white/60"><code>{{ code }}</code></pre>
    </details>
  </section>
</template>
