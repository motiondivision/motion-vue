<script setup lang="ts">
import { shallowRef } from 'vue'
import { LazyMotion, m, motion } from 'motion-v'
import type { domAnimation } from 'motion-v'

const enabled = shallowRef(true)
const completed = shallowRef(false)
const loaded = shallowRef(false)
let resolveFeatures!: (features: typeof domAnimation) => void
const loadFeatures = () => new Promise<typeof domAnimation>((resolve) => { resolveFeatures = resolve })

async function releaseFeatures() {
  const { domAnimation } = await import('motion-v')
  resolveFeatures(domAnimation)
  loaded.value = true
}
</script>

<template>
  <main class="fx-demo">
    <h1>Boolean fx marker</h1>
    <button
      type="button"
      :aria-pressed="enabled"
      @click="enabled = !enabled"
    >
      Toggle fx markers
    </button>
    <motion.div
      data-testid="component-marker"
      :fx="enabled"
    >
      HTML marker
    </motion.div>
    <motion.svg
      data-testid="svg-marker"
      :fx="enabled"
      width="40"
      height="40"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="currentColor"
      />
    </motion.svg>
    <motion.input
      data-testid="input-marker"
      :fx="enabled"
      aria-label="Marker input"
    />
    <h2>Delayed features</h2>
    <button
      type="button"
      :disabled="loaded"
      @click="releaseFeatures"
    >
      Load animation features
    </button>
    <LazyMotion
      :features="loadFeatures"
      strict
    >
      <m.div
        fx
        data-testid="lazy-marker"
        class="lazy-box"
        :initial="{ opacity: 0.25, x: 0 }"
        :animate="{ opacity: 1, x: 120 }"
        :transition="{ duration: 0.1 }"
        @animation-complete="completed = true"
      >
        Delayed animation
      </m.div>
    </LazyMotion>
    <p role="status">
      {{ completed ? 'Animation complete' : 'Waiting for features' }}
    </p>
  </main>
</template>

<style scoped>
.fx-demo { padding: 2rem; display: grid; justify-items: start; gap: 1rem; }
.lazy-box { padding: 1rem; background: #1d4ed8; color: white; }
</style>
