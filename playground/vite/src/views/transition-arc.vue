<script setup lang="ts">
import { ref } from 'vue'
// Use local alias for dev, not 'motion-vue'
import { arc, motion } from 'motion-v'

// Create the arc paths once at setup so their direction-continuity closure
// survives re-renders. NEVER inline `arc()` in the template — a fresh path
// on every render is amnesiac and loses the stable-screen-side behaviour.
const pingPongPath = arc({ strength: 0.5 })
const rotatePath = arc({ strength: 0.6, rotate: true })
const axisPath = arc({ strength: 0.5 })
const layoutPath = arc({ strength: 1, rotate: true })

// ping-pong: toggle between two corners, arc auto-picks a stable screen side
const pinged = ref(false)
const pingPong = () => (pinged.value = !pinged.value)

// axis-change: alternate a horizontal-dominant and a vertical-dominant move;
// the continuity closure keeps the bulge on the same screen side.
const axisStep = ref(0)
const axisTargets = [
  { x: 0, y: 0 },
  { x: 220, y: 0 }, // horizontal dominant
  { x: 220, y: 160 }, // vertical dominant
  { x: 0, y: 160 }, // horizontal dominant
]
const nextAxis = () => (axisStep.value = (axisStep.value + 1) % axisTargets.length)

// layout arc: shared-element move along a curve
const layoutLeft = ref(true)
const swapLayout = () => (layoutLeft.value = !layoutLeft.value)
</script>

<template>
  <div style="padding: 40px; display: flex; flex-direction: column; gap: 48px">
    <!-- 1. keyframe ping-pong -->
    <section>
      <h3>① keyframe arc — ping-pong</h3>
      <button
        data-testid="ping-btn"
        @click="pingPong"
      >
        Toggle
      </button>
      <div style="position: relative; height: 200px; margin-top: 16px">
        <motion.div
          data-testid="ping-box"
          :animate="pinged ? { x: 260, y: 120 } : { x: 0, y: 0 }"
          :transition="{ path: pingPongPath, duration: 1 }"
          style="width: 48px; height: 48px; background: #ff7b9c; border-radius: 8px"
        />
      </div>
    </section>

    <!-- 2. keyframe with tangent rotation -->
    <section>
      <h3>② keyframe arc — rotate (orient to path)</h3>
      <button
        data-testid="rotate-btn"
        @click="pingPong"
      >
        Toggle
      </button>
      <div style="position: relative; height: 200px; margin-top: 16px">
        <motion.div
          data-testid="rotate-box"
          :animate="pinged ? { x: 260, y: 120 } : { x: 0, y: 0 }"
          :transition="{ path: rotatePath, duration: 1 }"
          style="width: 60px; height: 24px; background: #79c0ff; border-radius: 4px"
        />
      </div>
    </section>

    <!-- 3. axis-change continuity -->
    <section>
      <h3>③ keyframe arc — axis-change continuity</h3>
      <button
        data-testid="axis-btn"
        @click="nextAxis"
      >
        Next ({{ axisStep }})
      </button>
      <div style="position: relative; height: 240px; margin-top: 16px">
        <motion.div
          data-testid="axis-box"
          :animate="axisTargets[axisStep]"
          :transition="{ path: axisPath, duration: 0.8 }"
          style="width: 40px; height: 40px; background: #7ee787; border-radius: 8px"
        />
      </div>
    </section>

    <!-- 4. layout arc -->
    <section>
      <h3>④ layout arc — shared element along a curve</h3>
      <button
        data-testid="layout-btn"
        @click="swapLayout"
      >
        Swap
      </button>
      <div
        style="display: flex; justify-content: space-between; margin-top: 16px; height: 120px"
      >
        <div style="width: 80px; display: flex; align-items: flex-start">
          <motion.div
            v-if="layoutLeft"
            data-testid="layout-box"
            layout-id="arc-shared"
            :transition="{ layout: { path: layoutPath, duration: 1 } }"
            style="width: 56px; height: 56px; background: #ffb86c; border-radius: 10px"
          />
        </div>
        <div style="width: 80px; display: flex; align-items: flex-end; justify-content: flex-end">
          <motion.div
            v-if="!layoutLeft"
            data-testid="layout-box"
            layout-id="arc-shared"
            :transition="{ layout: { path: layoutPath, duration: 1 } }"
            style="width: 56px; height: 56px; background: #ffb86c; border-radius: 10px"
          />
        </div>
      </div>
    </section>
  </div>
</template>
