<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div class="flex flex-col space-y-8 items-center justify-center p-8 h-screen">
    <!-- Basic Hover Animation -->
    <Motion
      :while-hover="{
        scale: 1.2,
        rotate: 5,
        transition: { type: 'spring' },
      }"
      class="bg-blue-500 w-32 h-32 rounded-lg cursor-pointer"
      @hover-start="console.log('hover start')"
      @hover-end="console.log('hover end')"
    />

    <!-- Hover with Color Change -->
    <Motion
      :while-hover="{
        backgroundColor: '#22c55e',
        y: -20,
        transition: { duration: 0.3 },
      }"
      class="bg-purple-500 w-32 h-32 rounded-full cursor-pointer"
    />

    <!-- Complex Hover Animation -->
    <Motion
      :initial="{ borderRadius: '16px' }"
      :while-hover="{
        scale: 1.1,
        borderRadius: '50%',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        transition: {
          duration: 0.4,
          ease: 'easeOut',
        },
      }"
      class="bg-pink-500 w-32 h-32 cursor-pointer"
    />
  </div>
</template>
