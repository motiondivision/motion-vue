<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-[#7b2ff7] to-[#f107a3] p-8">
    <Motion
      :animate="{
        backgroundColor: '#ffffff33',
        scale: 1,
      }"
      :press="{
        scale: 0.9,
        backgroundColor: '#ffffff66',
      }"
      class="w-64 h-64 rounded-xl backdrop-blur-sm flex items-center justify-center cursor-pointer"
      @press="console.log('press')"
      @press-cancel="console.log('press-cancel')"
      @press-start="console.log('press-start')"
    >
      <span class="text-white text-xl font-bold">Press Me!</span>
    </Motion>
  </div>
</template>

<style scoped>

</style>
