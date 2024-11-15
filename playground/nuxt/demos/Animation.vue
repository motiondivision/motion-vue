<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-vue'
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <div
    class="py-4 flex flex-col items-center"
    style="background:linear-gradient(135deg, #f08, #d0e)"
  >
    <button @click="show = !show">
      {{ show ? '隐藏' : '显示' }}
    </button>
    <AnimatePresence>
      <Motion
        v-if="show"
        :initial="{
          scale: 0,
        }"
        :animate="{
          scale: 1,
          rotate: 180,
        }"
        :exit="{
          scale: 0,
        }"
        :transition="{
          duration: 5,
        }"
        class="w-[200px] aspect-square bg-white rounded-md mx-auto"
        data-a="123"
      />
    </AnimatePresence>
  </div>
</template>

<style scoped>

</style>
