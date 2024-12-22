<script setup lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

const constraintsRef = ref<HTMLDivElement>()
</script>

<template>
  <div
    ref="constraintsRef"
    class="w-[300px] h-[300px] bg-[#dd00ee]/25 rounded-lg"
  >
    <Motion
      :drag="true"
      :drag-constraints="constraintsRef"
      class="w-[100px] h-[100px] bg-[#dd00ee] rounded-lg"
    />
  </div>
</template>
