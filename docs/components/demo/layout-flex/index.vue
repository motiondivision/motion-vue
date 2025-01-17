<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const isOn = ref(false)

function toggleSwitch() {
  isOn.value = !isOn.value
}
</script>

<template>
  <div class="flex items-center justify-center h-full w-full">
    <Motion
      :layout="true"
      class="switch bg-primary"
      :data-on="isOn"
      @click="toggleSwitch"
    >
      <Motion
        class="handle bg-primary-foreground"
        :data-on="isOn"
        :layout="true"
        :transition="{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }"
      />
    </Motion>
  </div>
</template>

<style scoped>
.switch {
  width: 160px;
  height: 100px;
  display: flex;
  justify-content: flex-start;
  border-radius: 50px;
  padding: 10px;
  cursor: pointer;
}

.switch[data-on="true"] {
  justify-content: flex-end;
}

  .handle {
    width: 80px;
    height: 80px;
    border-radius: 40px;
}
</style>
