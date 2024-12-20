<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="w-[300px] h-[300px] bg-red-500">
      <Motion
        layout
        drag
        class="w-[100px] h-[100px] bg-blue-500"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
