<script setup lang="ts">

</script>

<template>
  <Motion
    class="w-[100px] h-[100px] bg-purple-500 rounded-lg"
    :hover="{
      scale: 1.2,
    }"
    @hover-start="console.log('hover start')"
    @hover-end="console.log('hover end')"
  />
</template>
