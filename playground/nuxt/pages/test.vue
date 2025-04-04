<script setup lang="ts">
import { animate, motion, useMotionValue, useTransform } from 'motion-v'

const progress = useMotionValue(0)

const circleStrokeWidth = useTransform(progress, [0, 1], [0, 20])
const circleRotation = useTransform(progress, [0, 1], ['-90deg', '-90deg'])
const circleColor = useTransform(progress, [0, 1], ['#ffffff', '#8df0cc'])

const buttonScale = useTransform(progress, [0, 1], [1, 0.85])
const buttonProgressX = useTransform(progress, [0, 1], ['-200%', '0%'])

function handlePointerDown() {
  progress.set(0)
  animate(progress, 1, {
    duration: 2,
    ease: 'easeOut',
  })
}

function handlePointerUp() {
  animate(progress, 0, { duration: 0.3 })
}
</script>

<template>
  <div class="container">
    <div class="button-wrapper">
      <motion.button
        class="button"
        :style="{
          scale: buttonScale,
        }"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
      >
        <motion.div
          class="button-background"
          :style="{
            x: buttonProgressX,
          }"
        />
        Hold to confirm
      </motion.button>

      <motion.svg
        class="progress-ring"
        width="320"
        height="320"
        viewBox="0 0 320 320"
      >
        <motion.circle
          cx="160"
          cy="160"
          r="120"
          fill="none"
          stroke="var(--white-feint)"
          stroke-width="24"
          stroke-linecap="round"
          :style="{
            rotate: circleRotation,
            transformOrigin: 'center',
            opacity: progress,
            stroke: circleColor,
            strokeWidth: circleStrokeWidth,
            pathLength: progress,
          }"
        />
      </motion.svg>
    </div>
  </div>
</template>

<style>
.container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    padding: 16px;
    height: 80px;
}

.button-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.button {
    color: var(--black);
    background-color: var(--white);
    border-radius: 999px;
    padding: 12px 20px;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    will-change: transform;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}

.button-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--green);
    border-radius: 999px;
    z-index: -1;
    filter: blur(20px);
    scale: 2;
}
</style>
