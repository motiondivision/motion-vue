<script setup lang="ts">
const count = ref(0)
onUpdated(() => {
  console.log('child updated')
})
</script>

<template>
  <div @click="count++">
    this is child {{ count }}
    props:<slot />
  </div>
</template>

<style scoped>

</style>
