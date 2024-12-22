<script setup lang="ts">
import { useMotionValue, useTransform } from 'motion-v'

const x = useMotionValue(0)
const xInput = [-100, 0, 100]

const background = useTransform(x, xInput, [
  'linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)',
  'linear-gradient(180deg, #7700ff 0%, rgb(68, 0, 255) 100%)',
  'linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)',
])

const color = useTransform(x, xInput, [
  'rgb(211, 9, 225)',
  'rgb(68, 0, 255)',
  'rgb(3, 209, 0)',
])

const tickPath = useTransform(x, [10, 100], [0, 1])
const crossPathA = useTransform(x, [-10, -55], [0, 1])
const crossPathB = useTransform(x, [-50, -100], [0, 1])
</script>

<template>
  <Motion
    :style="{ background }"
    class="w-[300px] h-[300px] bg-[#dd00ee]/25 rounded-lg flex items-center justify-center"
  >
    <Motion
      :style="{ x }"
      drag="x"
      :drag-constraints="{ left: 0, right: 0 }"
      class="w-[100px] h-[100px] bg-white rounded-lg"
    >
      <svg
        class="progress-icon"
        viewBox="0 0 50 50"
      >
        <Motion
          as="path"
          fill="none"
          stroke-width="2"
          :stroke="color"
          d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
          :style="{ transform: 'translate(5px, 5px)' }"
        />
        <Motion
          as="path"
          fill="none"
          stroke-width="2"
          :stroke="color"
          d="M14,26 L 22,33 L 35,16"
          stroke-dasharray="0 1"
          :style="{ pathLength: tickPath }"
        />
        <Motion
          as="path"
          fill="none"
          stroke-width="2"
          :stroke="color"
          d="M17,17 L33,33"
          stroke-dasharray="0 1"
          :style="{ pathLength: crossPathA }"
        />
        <Motion
          as="path"
          fill="none"
          stroke-width="2"
          :stroke="color"
          d="M33,17 L17,33"
          stroke-dasharray="0 1"
          :style="{ pathLength: crossPathB }"
        />
      </svg>
    </Motion>
  </Motion>
</template>
