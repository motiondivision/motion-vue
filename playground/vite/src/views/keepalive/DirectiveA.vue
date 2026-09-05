<script setup lang="ts">
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('[DirectiveA] activated'))
onDeactivated(() => console.log('[DirectiveA] deactivated'))
</script>

<template>
  <div
    v-motion="{
      initial: { opacity: 0, y: -40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 1 },
      exit: { opacity: 0, y: 40 },
    }"
    class="panel panel-a"
  >
    Directive A
  </div>
</template>
