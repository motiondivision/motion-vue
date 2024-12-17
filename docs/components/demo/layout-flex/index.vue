<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

const isOn = ref(false)

function toggleSwitch() {
  isOn.value = !isOn.value
}
</script>

<template>
  <div class="app h-full w-full py-8 rounded-lg">
    <Motion
      :layout="true"
      class="switch"
      :data-on="isOn"
      @click="toggleSwitch"
    >
      <Motion
        class="handle"
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

<style>
.app {
  background: linear-gradient(250deg, #7b2ff7, #f107a3);
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.App {
  font-family: sans-serif;
  text-align: center;
}

.switch {
  width: 160px;
  height: 100px;
  background-color: rgba(255, 255, 255, 0.4);
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
    background-color: white;
  border-radius: 40px;
}
</style>
