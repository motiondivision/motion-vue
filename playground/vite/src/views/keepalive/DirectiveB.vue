<script setup lang="ts">
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[DirectiveB] activated'))
onDeactivated(() => console.log('[DirectiveB] deactivated'))
</script>

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: -40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 40 },
      transition: { duration: 1 },
    }"
    class="panel panel-b"
  >
    Directive B
  </div>
</template>
