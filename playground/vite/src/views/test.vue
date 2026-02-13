<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion, vMotion } from 'motion-v'

const isVisible = ref(true)
const x = ref(0)
</script>

<template>
  <div class="container">
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
            <Motion layout-id="123">
              <Motion
                layout-id="456"
              >
                Toggle m
              </Motion>
            </Motion>
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
