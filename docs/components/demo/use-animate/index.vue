<script setup lang="ts">
import { Motion, stagger, useAnimate } from 'motion-v'
import { onMounted } from 'vue'

const [scope, animate] = useAnimate()

onMounted(() => {
  animate('li', { y: 0, opacity: 1 }, {
    delay: stagger(0.1),
  })
})
</script>

<template>
  <ul
    ref="scope"
    class="space-y-4"
  >
    <Motion
      v-for="i in 3"
      :key="i"
      as="li"
      :initial="{ y: 10, opacity: 0 }"
      class="w-20 h-5 bg-primary rounded"
    >
      Item {{ i }}
    </Motion>
  </ul>
</template>

<style scoped>

</style>
