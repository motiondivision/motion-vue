<script setup>
import { Motion } from 'motion-v'
import { ref } from 'vue'

const variants = {
  normal: {
    x: 2,
  },
  animate: {
    x: [0, 30, -30, 20, -20, 0],
  },
}

const controls = ref()
</script>

<template>
  <div
    className="cursor-pointer select-none p-2 hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center overflow-hidden"
    role="button"
    tabindex="0"
    @mouseenter="() => (controls = variants.animate)"
    @mouseleave="() => (controls = variants.normal)"
  >
    <Motion
      d="M17 12H7"
      :variants="variants"
      initial="normal"
      :animate="controls"
      class="bg-black w-[10px] h-[10px]"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <Motion
        as="path"
        d="M17 12H7"
        :variants="variants"
        initial="normal"
        :animate="controls"
      />
      <path d="M19 18H5" />
      <path d="M21 6H3" />
    </svg>
  </div>
</template>
