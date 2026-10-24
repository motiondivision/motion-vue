<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'

const show = ref(false)
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-6 pb-24 pt-14">
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
        Layout
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white">
        Mount inside a scaling parent
      </h1>
      <p class="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/50">
        The outer element scales in from 0. The inner layout element must not
        play a layout animation when it mounts.
      </p>
    </header>

    <button
      id="toggle"
      class="btn btn-primary mb-4"
      @click="show = !show"
    >
      Toggle
    </button>

    <div class="relative min-h-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-6">
      <AnimatePresence>
        <motion.div
          v-if="show"
          id="container"
          :initial="{ scale: 0, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0, opacity: 0 }"
          :transition="{ duration: 0.3 }"
          class="w-fit rounded-xl border border-white/10 bg-white/[0.05] p-5"
        >
          <motion.div
            id="layout-child"
            layout
            :initial="false"
            class="h-[100px] w-[100px] rounded-lg bg-emerald-300/30"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
