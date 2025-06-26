<script setup lang="tsx">
/** @jsxImportSource vue */
import { ref } from 'vue'

const isShow = ref(false)
</script>

<template>
  <button @click="isShow = !isShow">
    show
  </button>
  <MotionConfig reduced-motion="user">
    <Motion
      class="w-[100px] h-[100px] bg-red-500"
      :animate="{
        scale: isShow ? 1 : 0.5,
      }"
    />
  </MotionConfig>
</template>

<style>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.number {
    font-size: 78px;
}

.controls {
    display: flex;
    gap: 20px;
    border-radius: 50px;
}

.controls > div {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
}

.switch-container {
    width: 40px;
    height: 20px;
    border-radius: 25px;
    cursor: pointer;
    display: flex;
    padding: 5px;
}

.switch-handle {
    width: 20px;
    height: 20px;
    background-color: #4ff0b7;
    border-radius: 50%;
}
</style>
