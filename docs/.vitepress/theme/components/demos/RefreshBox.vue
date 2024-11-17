<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Motion } from 'motion-v'

defineProps<{
  title?: string
}>()
const key = ref(0)
</script>

<template>
  <div
    :key="key"
    class="relative rounded-2xl aspect-square overflow-hidden flex justify-center items-center"
  >
    <slot />
    <div class="absolute bottom-0 left-0 w-full text-white p-4 bg-transparent flex justify-between items-center ">
      <h2 class="font-semibold">
        {{ title }}
      </h2>
      <Motion
        :as-child="true"
        :initial="{ rotate: 0 }"
        :animate="{ rotate: 360 }"
        :transition="{
          type: 'spring',
        }"
      >
        <Icon
          icon="mdi:refresh"
          class=" bottom-4 right-4 w-7 h-7 cursor-pointer bg-black/20 rounded-full p-1.5 "
          @click="key++"
        />
      </Motion>
    </div>
  </div>
</template>

<style scoped>

</style>
