<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, vMotion } from 'motion-v'

const isVisible = ref(true)
const x = ref(0)
</script>

<template>
  <div class="container">
    <h1>v-motion Directive</h1>

    <div class="grid">
      <!-- 1. Props extraction syntax -->
      <section>
        <h2>Props Extraction</h2>
        <p>v-motion as marker, config as individual props</p>
        <div
          v-motion=""
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          class="box"
        >
          Fade In
        </div>
      </section>

      <!-- 2. Binding value syntax -->
      <section>
        <h2>Binding Value</h2>
        <p>Single object as directive value</p>
        <div
          v-motion="{
            initial: { opacity: 0, x: -30 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.6 },
          }"
          class="box"
        >
          Slide In
        </div>
      </section>

      <!-- 3. initial: false (skip initial, start at animate) -->
      <section>
        <h2>initial: false</h2>
        <p>No enter animation, directly at animate state</p>
        <div
          v-motion
          :initial="false"
          :animate="{ opacity: 1, scale: 1 }"
          class="box"
        >
          No Entry Animation
        </div>
      </section>

      <!-- 4. Hover & Press gesture -->
      <section>
        <h2>Hover &amp; Press</h2>
        <p>Gesture animations via props</p>
        <div
          v-motion
          :whileHover="{ scale: 1.1, rotate: 3 }"
          :whilePress="{ scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 17 }"
          class="box interactive"
        >
          Hover / Press me
        </div>
      </section>

      <!-- 5. Variant-based -->
      <section>
        <h2>Variants</h2>
        <p>String labels referencing variants map</p>
        <div
          v-motion
          initial="hidden"
          animate="visible"
          :variants="{
            hidden: { opacity: 0, x: -60, scale: 0.8 },
            visible: { opacity: 1, x: 0, scale: 1 },
          }"
          :transition="{ type: 'spring', bounce: 0.4 }"
          class="box"
        >
          Variant Slide
        </div>
      </section>

      <!-- 6. While In View -->
      <section>
        <h2>While In View</h2>
        <p>Scroll down to trigger</p>
        <div style="height: 120px" />
        <div
          v-motion
          :initial="{ opacity: 0, y: 60 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          class="box"
        >
          In View
        </div>
      </section>
    </div>

    <!-- 7. Reactive binding -->
    <section>
      <h2>Reactive Binding</h2>
      <div class="controls">
        <button @click="x -= 80">
          &larr; Left
        </button>
        <button @click="x = 0">
          Reset
        </button>
        <button @click="x += 80">
          Right &rarr;
        </button>
      </div>
      <div
        v-motion
        :animate="{ x }"
        :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        class="box"
      >
        x: {{ x }}
      </div>
    </section>

    <!-- 8. Mount / Unmount -->
    <section>
      <h2>Mount / Unmount</h2>
      <button @click="isVisible = !isVisible">
        {{ isVisible ? 'Hide' : 'Show' }}
      </button>
      <div style="height: 120px; position: relative">
        <AnimatePresence>
          <div
            v-if="isVisible"
            v-motion
            :initial="{ opacity: 0, scale: 0.5, rotate: -10 }"
            :animate="{ opacity: 1, scale: 1, rotate: 0 }"
            :exit="{ opacity: 0, scale: 0.5, rotate: 10 }"
            :transition="{ type: 'spring', duration: 0.5 }"
            class="box"
          >
            Toggle me
          </div>
        </AnimatePresence>
      </div>
    </section>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

h2 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

p {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

.box {
  width: 180px;
  height: 90px;
  background: #646cff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.box.interactive {
  cursor: pointer;
  user-select: none;
}

.controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.75rem;
}

button {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
}

button:hover {
  background: #f0f0f0;
}
</style>
