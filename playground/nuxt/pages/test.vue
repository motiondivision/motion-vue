<script setup lang="ts">
import { ref } from 'vue'
import { Motion, useMotionValue } from 'motion-v'

const counter = ref(0)
function updateComponent() {
  counter.value += 1
}

const rotate = useMotionValue(0)
function updateMotionValue() {
  rotate.set(rotate.get() + 10)
}
</script>

<template>
  <Motion
    as-child

    :style="{ rotate }"
  >
    <div class="w-10 h-10 bg-red-500">
      {{ counter }}
    </div>
  </Motion>

  <button @click="updateComponent">
    Update component
  </button>
  <button @click="updateMotionValue">
    Update motion value
  </button>
</template>
