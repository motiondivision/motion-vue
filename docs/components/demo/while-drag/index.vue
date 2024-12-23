<script setup lang="ts">

</script>

<template>
  <div class="flex items-center justify-center min-h-[200px]">
    <Motion
      class="w-[100px] h-[100px] bg-purple-500 rounded-lg cursor-move"
      drag
      :while-drag="{
        scale: 1.2,
        rotate: 90,
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      }"
    />
  </div>
</template>

<style scoped>

</style>
