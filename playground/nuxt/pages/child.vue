<script setup lang="ts">
const position = ref({ top: 100, left: 100 })

const style = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}))
function onMove() {
  position.value.left += 10
}
</script>

<template>
  <div
    class="rect"
    :style="style"
    @click="onMove"
  />
</template>

<style scoped>
.rect {
  position: fixed;
  width: 100px;
  height: 100px;
  background: blue;
}
</style>
