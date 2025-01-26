<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    class="w-[100px] h-[100px] bg-purple-500 rounded-lg"
    :press="{
      scale: 0.8,
    }"
    @press-start="console.log('press start')"
    @press="console.log('press')"
    @press-cancel="console.log('press cancel')"
  />
</template>
