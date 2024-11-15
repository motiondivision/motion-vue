<script setup>
import { ref } from 'vue'

// 存储离场动画的状态
const leavingStyles = ref(null)

function handleBeforeLeave(el) {
  // 保存当前计算样式
  leavingStyles.value = window.getComputedStyle(el)
}

function handleLeaveCancelled(el) {
  if (leavingStyles.value) {
    // 将离场时的样式作为入场动画的起始状态
    const styles = leavingStyles.value
    Object.assign(el.style, {
      transform: styles.transform,
      opacity: styles.opacity,
      // 其他需要过渡的属性...
    })

    // 强制重排，确保样式生效
    el.offsetHeight

    // 清除保存的样式
    leavingStyles.value = null
  }
}
</script>

<template>
  <Transition
    @before-leave="handleBeforeLeave"
    @leave-cancelled="handleLeaveCancelled"
  >
    <slot />
  </Transition>
</template>
