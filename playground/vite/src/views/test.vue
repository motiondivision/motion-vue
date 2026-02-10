<script setup>
import { LazyMotion, m, motionValue } from 'motion-v'

const x = motionValue(0)

const features = () => import('./test').then(mod => mod.default)
function onComplete() {
  console.log('animation complete')
}
</script>

<template>
  <LazyMotion :features="features">
    <m.div
      :animate="{ x: 100 }"
      :style="{ x }"
      class="w-10 h-10 bg-red-500"
      @animation-complete="onComplete"
    />
  </LazyMotion>
</template>

  <style scoped>
  .wrapper {
    display: grid;
    place-items: center;
    height: 100vh
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
  }

  .list li {
    display: flex;
    cursor: pointer;
    align-items: center;
    gap: 16px;
    padding: 8px;
    background: white;
  }

  .active-item {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 10;
  }

  .active-item .inner {
    display: flex;
    width: 400px;
    flex-direction: column;
    gap: 16px;
    background: white;
    padding: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .long-description {
    font-size: 14px;
    color: #63635d;
  }

  .overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
  }

  .controls {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
  }

  .hint {
    font-size: 13px;
    color: #b45309;
  }
  </style>

  <style>
  * {
    box-sizing: border-box;
    margin: 0;
  }

  body,
  html,
  #app {
    height: 100%;
  }

  body {
    font-family: system-ui, sans-serif;
  }
  </style>
