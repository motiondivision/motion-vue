<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <div class="flex flex-col gap-2 place-items-center">
    <Motion
      as="div"
      class="w-8 h-8 bg-blue-500 rounded-lg cursor-pointer"
      :initial="{
        opacity: 0,
        scale: 1,
      }"
      :animate="{
        scale: 3,
        opacity: 1,
      }"
      :transition="{
        duration: 3,
      }
      "
    />
  </div>
</template>
