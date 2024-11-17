<script setup lang="ts">
import { Motion } from 'motion-v'
import RefreshBox from './RefreshBox.vue'

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
  },
} as any

const items = {
  hidden: { y: 20, opacity: 0, scale: 0.85 },
  visible: {
    y: 0,
    opacity: 1,
  },
} as any

const list = [0, 1, 2, 3, 4]

const icon = {
  hidden: {
    opacity: 0,
    pathLength: 0,
    fill: 'rgba(255, 255, 255, 0)',
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    fill: 'rgba(255, 255, 255, 1)',
  },
}
</script>

<template>
  <div class="grid gap-4 xs:grid-cols-1 sm:grid-cols-4">
    <RefreshBox
      title="Animation"
      style="background: linear-gradient(180deg, #f08, #d0e);"
    >
      <Motion
        class="bg-white w-1/3 aspect-square rounded-2xl"
        :initial="{ scale: 0 }"
        :animate="{ rotate: 180, scale: 1 }"
        :transition="{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.6,
        }"
      />
    </RefreshBox>
    <RefreshBox
      title="Variants"
      style="background: linear-gradient(180deg, #d0e, #91f);"
    >
      <Motion
        as="ul"
        :variants="container"
        initial="hidden"
        animate="visible"
        :transition="{
          duration: 0.3,
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }"
        class="rounded-2xl overflow-hidden  list-none p-2  grid-cols-2 grid-rows-2 aspect-square bg-white/20 w-1/3  grid"
      >
        <Motion
          v-for="(item, i) in list"
          :key="item"
          :variants="items"
          :transition="{
            delay: 0.3 + i * 0.2,
          }"
          class="bg-white rounded-full origin-center"
        />
      </Motion>
    </RefreshBox>
    <RefreshBox
      title="Gestures"
      style="background: linear-gradient(180deg, #91f, #70f);"
    >
      <Motion
        :hover="{ scale: 1.2, rotate: 90 }"
        :press="{
          scale: 0.8,
          rotate: -90,
          borderRadius: '100%',
        }"
        :transition="{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }"
        as="button"
        class="rounded-2xl overflow-hidden  list-none p-2  grid-cols-2 grid-rows-2 aspect-square bg-white w-1/3  grid"
        @hoverstart="console.log('hoverstart')"
        @hoverend="console.log('hoverend')"
        @pressstart="console.log('pressstart')"
        @pressend="console.log('pressend')"
      />
    </RefreshBox>

    <RefreshBox
      title="Path"
      style="background: linear-gradient(180deg, #05f, #09f);"
    >
      <Motion
        as="svg"
        viewBox="0 0 100 100"
        :style="{
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }"
        class="rounded-2xl overflow-hidden stroke-white stroke-2   list-none p-4  grid-cols-2 grid-rows-2 aspect-square bg-white/20 w-1/3  grid"
      >
        <Motion
          as="path"
          d="M0 100V0l50 50 50-50v100L75 75l-25 25-25-25z"
          :variants="icon"
          :initial="{
            opacity: 0,
            pathLength: 0,
            fill: 'rgba(255, 255, 255, 0)',
          }"
          :animate="{
            opacity: 1,
            pathLength: 1,
            fill: 'rgba(255, 255, 255, 1)',
          }"
          :transition="{
            duration: 2,
            ease: 'easeInOut',
            fill: {
              duration: 2,
              ease: [1, 0, 0.8, 1],
            },
          }"
        />
      </Motion>
    </RefreshBox>
  </div>
</template>
