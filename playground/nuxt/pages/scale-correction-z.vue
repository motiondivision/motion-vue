<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'

/**
 * 这是一个Framer Motion 2缩放校正的示例。
 *
 * 通常情况下,当使用scale在不同大小的布局之间进行动画时,
 * 子元素和borderRadius、boxShadow等样式会产生视觉失真。
 *
 * Framer Motion 2会自动校正这种失真。要查看传统FLIP技术
 * 产生的失真效果:
 *   - 移除子组件上的layout属性
 *   - 移除父组件的borderRadius: 50,改为在styles.css中
 *     的.parent定义中添加border-radius: 50px
 */

const isOpen = ref(false)

function toggleOpen() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="app h-screen w-screen">
    <Motion
      :layout="true"
      :data-open="isOpen"
      :initial="{ borderRadius: 50 }"
      class="h-[100px] w-[100px] flex rounded items-center justify-center bg-white data-[open=true]:h-[200px] data-[open=true]:w-[400px]"
      @click="toggleOpen"
    >
      <Motion
        :data-open="isOpen"
        :layout="true"
        class="h-10 w-10 rounded-full bg-[#f107a3]"
      />
    </Motion>
  </div>
</template>

<style>
.App {
  @apply bg-gradient-to-tr from-[#7b2ff7] to-[#f107a3] bg-no-repeat flex justify-center items-center;

}
</style>
