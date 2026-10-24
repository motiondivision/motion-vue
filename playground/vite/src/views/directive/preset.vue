<script setup lang="ts">
import { ref } from 'vue'

// v-fade-in, v-slide-up, v-scale-in are globally registered
// via MotionPlugin presets in main.ts — no imports needed.

const show = ref(true)
const exits = ref(0)

const shown = ref(true)

const page = ref(0)
const pages = ['First', 'Second', 'Third']
</script>

<template>
  <div class="container">
    <h1>Preset Directives</h1>

    <div class="grid">
      <!-- 1. Basic fade-in preset -->
      <section>
        <h2>v-fade-in</h2>
        <p>Preset with baked-in fade animation</p>
        <div
          v-fade-in
          data-testid="fade-in"
          class="box"
        >
          Fade In
        </div>
      </section>

      <!-- 2. Slide-up preset -->
      <section>
        <h2>v-slide-up</h2>
        <p>Preset with slide-up + fade</p>
        <div
          v-slide-up
          data-testid="slide-up"
          class="box"
        >
          Slide Up
        </div>
      </section>

      <!-- 3. Scale-in preset -->
      <section>
        <h2>v-scale-in</h2>
        <p>Preset with spring scale-in</p>
        <div
          v-scale-in
          data-testid="scale-in"
          class="box"
        >
          Scale In
        </div>
      </section>

      <!-- 4. Preset with user override -->
      <section>
        <h2>Override Preset</h2>
        <p>v-fade-in with user-provided initial override</p>
        <div
          v-fade-in="{ initial: { opacity: 0, x: -50 }, transition: { duration: 0.5 } }"
          data-testid="override"
          class="box"
        >
          Override
        </div>
      </section>
    </div>

    <!-- 5. Toggle preset element (v-if exit) -->
    <section>
      <h2>Toggle · v-if exit</h2>
      <p>The element stays mounted while its exit runs, then unmounts</p>
      <button
        data-testid="toggle-btn"
        @click="show = !show"
      >
        {{ show ? 'Hide' : 'Show' }}
      </button>
      <span
        class="counter"
        data-testid="exit-count"
      >exits completed: {{ exits }}</span>
      <div style="height: 120px; position: relative">
        <AnimatePresence @exit-complete="exits++">
          <div
            v-if="show"
            v-fade-in
            data-testid="toggle-target"
            class="box"
          >
            Toggle me
          </div>
        </AnimatePresence>
      </div>
    </section>

    <!-- 6. v-show exit -->
    <section>
      <h2>Toggle · v-show exit</h2>
      <p>display: none is deferred until the exit animation settles</p>
      <button
        data-testid="show-btn"
        @click="shown = !shown"
      >
        {{ shown ? 'Hide' : 'Show' }}
      </button>
      <div style="height: 120px; position: relative">
        <AnimatePresence>
          <div
            v-show="shown"
            v-fade-in
            data-testid="show-target"
            class="box"
          >
            v-show me
          </div>
        </AnimatePresence>
      </div>
    </section>

    <!-- 7. Keyed swap in wait mode -->
    <section>
      <h2>Wait mode · keyed swap</h2>
      <p>The outgoing page finishes its exit before the next one enters</p>
      <div class="controls">
        <button
          v-for="(label, index) in pages"
          :key="label"
          :data-testid="`wait-tab-${index}`"
          @click="page = index"
        >
          {{ label }}
        </button>
      </div>
      <div style="height: 120px; position: relative">
        <AnimatePresence mode="wait">
          <div
            :key="page"
            v-fade-in
            :data-testid="`wait-page-${page}`"
            class="box"
          >
            {{ pages[page] }}
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

.controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.counter {
  margin-left: 0.75rem;
  font-size: 0.8rem;
  color: #888;
}

button {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

button:hover {
  background: #f0f0f0;
}
</style>
